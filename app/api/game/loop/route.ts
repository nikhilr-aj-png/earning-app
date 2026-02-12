import { NextResponse } from 'next/server';
import { supabaseGame, supabaseMain, supabaseGameAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// FORCE 2X Logic: If pool is not enough, create inflation (Coin Minting)
const FORCE_2X_PAYOUT = true;
const GAME_DURATION_MINUTES = 2; // Short duration

export async function GET(request: Request) {
    const debugLog: any[] = []; // Store logs to return to user
    let resolutionSummary: any[] = []; // Unified summary for both active and orphan logic

    try {
        const now = new Date();
        debugLog.push(`Server Time: ${now.toISOString()}`);

        // 1. Fetch Active Games
        const { data: activeGames, error: activeError } = await supabaseGameAdmin
            .from('prediction_events')
            .select('*')
            .eq('status', 'active')
            .order('expires_at', { ascending: true });

        if (activeError) {
            debugLog.push(`Error fetching active: ${activeError.message}`);
            throw activeError;
        }

        debugLog.push(`Active Games Found: ${activeGames?.length || 0}`);

        // A. If we have active game(s)...
        if (activeGames && activeGames.length > 0) {
            const currentGame = activeGames[0];
            debugLog.push(`Current Game ID: ${currentGame.id}, Expires: ${currentGame.expires_at}`);

            if (new Date(currentGame.expires_at) > now) {
                return NextResponse.json({
                    status: 'running',
                    expires_at: currentGame.expires_at,
                    message: "Game Running",
                    debug: debugLog
                });
            }

            // B. Resolve Logic
            debugLog.push("Game Expired. Resolving...");

            // C. Clean Up Old/Completed Games
            const expiredGames = activeGames.filter((g: any) => new Date(g.expires_at) <= now);
            // resolutionSummary is now global for this request

            for (const game of expiredGames) {
                // Initialize result object for this game
                const gameResolutionResult: any = { id: game.id };

                // ... Resolution Logic ...
                // (I will omit detailing the logic here for the 'Thought' trace, but putting full code in tool call)

                // Winner Calc
                const pool1 = Number(game.pool_1) || 0;
                const pool2 = Number(game.pool_2) || 0;
                let winner: string | null = null;
                let isTie = false;

                if (pool1 === 0 && pool2 === 0) winner = Math.random() > 0.5 ? 'option_1' : 'option_2';
                else if (pool1 === pool2) { isTie = true; winner = 'tie'; }
                else if (pool1 < pool2) winner = 'option_1';
                else winner = 'option_2';

                debugLog.push(`Resolving Game ${game.id}: Winner=${winner}, Tie=${isTie}`);

                // Payouts (Skipping detailed bet logic in thought, sticking to code)
                const { data: allBets } = await supabaseGameAdmin
                    .from('prediction_bets')
                    .select('*')
                    .eq('event_id', game.id);

                if (allBets && allBets.length > 0) {
                    await Promise.all(allBets.map(async (bet: any) => {
                        // Win/Loss calc...
                        let payout = 0;
                        let status = 'lost';
                        if (isTie) { payout = Number(bet.amount) * 0.5; status = 'refunded'; }
                        else if (bet.choice === winner) { payout = Number(bet.amount) * 2; status = 'won'; }

                        if (payout > 0) {
                            try {
                                await supabaseMain.rpc('increment_user_coins', { u_id: bet.user_id, amount: payout });
                                await supabaseMain.from('transactions').insert({
                                    user_id: bet.user_id, amount: payout, type: isTie ? 'refund' : 'win',
                                    description: isTie ? 'Tie Refund' : 'Win Payout'
                                });
                            } catch (e: any) { debugLog.push(`Payout Error: ${e.message}`); }
                        }

                        await supabaseGameAdmin.from('prediction_bets').update({ status, payout }).eq('id', bet.id);
                    }));
                }

                // RESOLVE THE GAME IN DB first
                const { error: resolveError } = await supabaseGameAdmin
                    .from('prediction_events')
                    .update({ status: 'resolved', winner: winner })
                    .eq('id', game.id);

                if (resolveError) {
                    debugLog.push(`Error Resolving Event: ${resolveError.message}`);
                    resolutionSummary.push({ id: game.id, error: resolveError.message });
                    // If resolution failed, DO NOT create next game to avoid dual-active state.
                    continue;
                } else {
                    debugLog.push("Event Resolved Successfully.");
                    debugLog.push(`Event ${game.id} Resolved Successfully.`);
                }

                // 3. IMMEDIATE CHAIN REACTION
                // RULE: Only 'auto' games restart. 'manual' games match the user request to "expire and stop".
                if (game.resolution_method === 'manual') {
                    debugLog.push(`Game ${game.id} is MANUAL. Stopping chain.`);
                    continue;
                }

                // For AUTO games: Create Next Game ONLY if we just resolved one (and it succeeded).
                let nextGame = null;
                if (!resolveError) { // Only create next game if resolution was successful
                    debugLog.push(`Chain Reaction for Room ${game.room_id}: Creating Next Game...`);
                    const nextExpiry = new Date(now.getTime() + GAME_DURATION_MINUTES * 60000);
                    const roundNumber = Math.floor(now.getTime() / 1000);

                    // ADAPTIVE INSERT: Try V2 (Multi-Room), Fallback to V1 (Legacy)
                    let newGameData, nextGameError;

                    const gamePayloadCommon = {
                        title: `Round #${roundNumber}`,
                        question: "Who will win?",
                        option_1_label: "KING",
                        option_1_image: "/assets/cards/king.png",
                        option_2_label: "QUEEN",
                        option_2_image: "/assets/cards/queen.png",
                        min_bet: 10,
                        target_audience: 'all',
                        expiry_minutes: GAME_DURATION_MINUTES,
                        expires_at: nextExpiry.toISOString(),
                        status: 'active',
                        bet_mode: 'flexible',
                        resolution_method: 'auto',
                        pool_1: 0,
                        pool_2: 0
                    };

                    try {
                        // TRY V2: With Room ID
                        const res = await supabaseGameAdmin
                            .from('prediction_events')
                            .insert([{ ...gamePayloadCommon, room_id: game.room_id || crypto.randomUUID() }])
                            .select()
                            .single();
                        newGameData = res.data;
                        nextGameError = res.error;

                        if (nextGameError && nextGameError.code === '42703') throw nextGameError; // Column missing
                    } catch (e) {
                        // FALLBACK V1: Without Room ID
                        debugLog.push("Schema mismatch (missing room_id). Falling back to Legacy Insert.");
                        const res = await supabaseGameAdmin
                            .from('prediction_events')
                            .insert([gamePayloadCommon])
                            .select()
                            .single();
                        newGameData = res.data;
                        nextGameError = res.error;
                    }

                    if (nextGameError) {
                        // Check for duplicate key error (race condition) and ignore if so
                        if (nextGameError.code === '23505' || nextGameError.message?.includes('duplicate key')) {
                            debugLog.push(`Room ${game.room_id} is blocked. Attempting Force-Spawn in NEW ROOM...`);

                            // ESCAPE HATCH: Abandon stuck room, Start fresh series
                            // Note: If we are in Legacy Mode (no room_id), we can't really "change room".
                            // But we can try to insert again, maybe the blocker moved? 
                            // Actually in Legacy Mode, unique constraint is on STATUS only. 
                            // So if it failed, it means another game is active. we should just wait.

                            // Only apply Escape Hatch if V2
                            try {
                                const escapeRoomId = crypto.randomUUID();
                                const { data: escapeGame, error: escapeError } = await supabaseGameAdmin
                                    .from('prediction_events')
                                    .insert([{ ...gamePayloadCommon, room_id: escapeRoomId }])
                                    .select()
                                    .single();

                                if (escapeError) {
                                    // If this fails (e.g. column missing), we are in legacy mode and truly blocked.
                                    debugLog.push(`Escape Hatch Failed (or Legacy Mode): ${escapeError.message}`);
                                    gameResolutionResult.new_game_error = escapeError.message;
                                } else {
                                    debugLog.push(`Escape Successful: Force-Started Game ${escapeGame.id} in Room ${escapeRoomId}`);
                                    gameResolutionResult.new_game = escapeGame;
                                    (resolutionSummary as any).new_game = escapeGame;
                                }
                            } catch (e) {
                                debugLog.push("Escape Hatch: Schema does not support multiple rooms.");
                            }
                        } else {
                            debugLog.push(`Creation Error Room ${game.room_id}: ${nextGameError.message}`);
                            gameResolutionResult.new_game_error = nextGameError.message;
                        }
                    } else {
                        nextGame = newGameData;
                        debugLog.push(`New Game Created in Room ${game.room_id}: ${nextGame.id}`);
                        gameResolutionResult.new_game = nextGame;
                    }
                }
                resolutionSummary.push(gameResolutionResult);
            }

            // Return summary of all processed games
            return NextResponse.json({
                status: resolutionSummary.length > 0 ? 'resolved_updates' : 'no_action_needed',
                resolved_games: resolutionSummary,
                debug: debugLog
            });
        }

        // 3. ORPHAN CHECK: Find resolved games that didn't spawn a child
        // This fixes the "Stuck on Resolved" issue if the chain failed midway.
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
        const { data: recentResolved } = await supabaseGameAdmin
            .from('prediction_events')
            .select('*')
            .eq('status', 'resolved')
            .gt('created_at', fiveMinutesAgo.toISOString());

        if (recentResolved && recentResolved.length > 0) {
            for (const parent of recentResolved) {
                // Ignore MANUAL games for resurrection (User wants them to stop)
                if (parent.resolution_method === 'manual') continue;

                // Look for a child game
                // If V2 (Room ID), check room. If V1 (Legacy), check if ANY active game exists (imperfect but safe).
                let hasChild = false;

                if (parent.room_id) {
                    const { count } = await supabaseGameAdmin
                        .from('prediction_events')
                        .select('*', { count: 'exact', head: true })
                        .eq('room_id', parent.room_id)
                        .eq('status', 'active');
                    hasChild = (count || 0) > 0;
                } else {
                    // Legacy Check: If there is ANY active game, assume it's the child (to prevent double spawn)
                    const { count } = await supabaseGameAdmin
                        .from('prediction_events')
                        .select('*', { count: 'exact', head: true })
                        .eq('status', 'active');
                    hasChild = (count || 0) > 0;
                }

                if (!hasChild) {
                    debugLog.push(`Found Orphaned Game ${parent.id}. Resurrecting...`);
                    // SPAWN NEW CHILD
                    const nextExpiry = new Date(now.getTime() + GAME_DURATION_MINUTES * 60000);
                    const roundNumber = Math.floor(now.getTime() / 1000);

                    // Use common payload
                    const gamePayloadCommon = {
                        title: `Round #${roundNumber}`,
                        question: "Who will win?",
                        option_1_label: "KING",
                        option_1_image: "/assets/cards/king.png",
                        option_2_label: "QUEEN",
                        option_2_image: "/assets/cards/queen.png",
                        min_bet: 10,
                        target_audience: 'all',
                        expiry_minutes: GAME_DURATION_MINUTES,
                        expires_at: nextExpiry.toISOString(),
                        status: 'active',
                        bet_mode: 'flexible',
                        resolution_method: 'auto',
                        pool_1: 0,
                        pool_2: 0
                    };

                    try {
                        // TRY V2: With Room ID (Parent's Room)
                        await supabaseGameAdmin
                            .from('prediction_events')
                            .insert([{ ...gamePayloadCommon, room_id: parent.room_id || crypto.randomUUID() }]);

                        debugLog.push("Orphan Resurrected Successfully (V2).");
                        resolutionSummary.push({ id: parent.id, status: 'resurrected' });
                    } catch (e: any) {
                        let handled = false;

                        // Case 1: Schema Mismatch (Missing room_id)
                        if (e.code === '42703') {
                            try {
                                await supabaseGameAdmin
                                    .from('prediction_events')
                                    .insert([gamePayloadCommon]); // No room_id
                                debugLog.push("Orphan Resurrected Successfully (Fallback V1).");
                                resolutionSummary.push({ id: parent.id, status: 'resurrected' });
                                handled = true;
                            } catch (e2) {
                                debugLog.push(`Orphan Fallback Failed: ${(e2 as any).message}`);
                            }
                        }

                        // Case 2: Duplicate Key (Blocked Room)
                        if (!handled && (e.code === '23505' || e.message?.includes('duplicate key'))) {
                            debugLog.push(`Orphan Room Blocked. Attempting Force-Spawn...`);
                            try {
                                const escapeRoomId = crypto.randomUUID();
                                await supabaseGameAdmin
                                    .from('prediction_events')
                                    .insert([{ ...gamePayloadCommon, room_id: escapeRoomId }]);
                                debugLog.push("Orphan Force-Spawn Successful.");
                                resolutionSummary.push({ id: parent.id, status: 'resurrected_force' });
                                handled = true;
                            } catch (e3) {
                                debugLog.push(`Orphan Force-Spawn Failed: ${(e3 as any).message}`);
                            }
                        }

                        if (!handled) debugLog.push(`Resurrect Error: ${e.message}`);
                    }
                }
            }
        }

        // 4. NO ACTIVE GAMES FOUND - AUTO RESURRECT MODE
        // If we get here, it means activeGames.length === 0.
        // We must check if we should restart the system.

        debugLog.push("No Active Games Found. Checking for Auto-Resurrect...");

        // Safety: Only auto-create if no recent resolved games (to avoid race with the resolver above)
        // actually, if we are here, the resolver above didn't run because activeGames was empty.

        // CRITICAL CHECK: Does the user WANT auto-loop?
        // Since we removed the toggle, we assume YES unless we can deduce otherwise.
        // However, if the user explicitly deleted everything, maybe they want silence.
        // But the user requested "Auto Mode" to always run. 
        // We will keep Auto-Resurrect ACTIVE to ensure "Indestructible" auto-mode as requested.

        const nextExpiry = new Date(now.getTime() + GAME_DURATION_MINUTES * 60000); // 2 Minutes
        const roundNumber = Math.floor(now.getTime() / 1000);
        const roomId = crypto.randomUUID();

        // Check if we really have 0 games (double check)
        const { count: activeCount } = await supabaseGameAdmin
            .from('prediction_events')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

        if (activeCount === 0) {
            debugLog.push("System Fully Idle. Initiating Auto-Resurrect Sequence...");

            // ADAPTIVE INSERT (Room Aware)
            const gamePayload = {
                title: `Round #${roundNumber}`,
                question: "Who will win?",
                option_1_label: "KING",
                option_1_image: "/assets/cards/king.png",
                option_2_label: "QUEEN",
                option_2_image: "/assets/cards/queen.png",
                min_bet: 10,
                target_audience: 'all',
                expiry_minutes: GAME_DURATION_MINUTES,
                expires_at: nextExpiry.toISOString(),
                status: 'active',
                bet_mode: 'flexible',
                resolution_method: 'auto',
                pool_1: 0,
                pool_2: 0
            };

            // Try Insert
            try {
                // Try V2 (Multi-Room)
                await supabaseGameAdmin
                    .from('prediction_events')
                    .insert([{ ...gamePayload, room_id: roomId }]);
            } catch (e) {
                // Fallback V1
                await supabaseGameAdmin
                    .from('prediction_events')
                    .insert([gamePayload]);
            }

            return NextResponse.json({
                status: 'resurrected',
                message: "System was idle. Auto-started new game.",
                debug: debugLog
            });
        }

        return NextResponse.json({
            status: 'idle',
            message: "Games exist but none returned in query (Race condition?)",
            debug: debugLog
        });

    } catch (error: any) {
        // Handle Unique Constraint Violation (Race Condition) - This is expected and safe.
        if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('one_active_game_constraint')) {
            debugLog.push("Race Condition: Another process created the game first. Skipping.");
            return NextResponse.json({ success: true, message: 'Game already active (Race Condition handled)', debug: debugLog });
        }

        debugLog.push(`CRITICAL ERROR: ${error.message}`);
        return NextResponse.json({ error: error.message, debug: debugLog }, { status: 500 });
    }
}
