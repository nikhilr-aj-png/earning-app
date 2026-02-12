export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseGame } from '@/lib/supabase';
import { supabaseMain as supabase } from '@/lib/supabase'; // Access Main DB for Wallet

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { event_id, winner } = body; // winner: 'option_1' or 'option_2'

        if (!event_id || !winner) {
            return NextResponse.json({ error: 'Event ID and Winner are required' }, { status: 400 });
        }

        // 1. Fetch Initial State (Quick check)
        const { data: event, error: eventError } = await supabaseGame
            .from('prediction_events')
            .select('status')
            .eq('id', event_id)
            .single();

        if (eventError || !event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        if (event.status === 'completed') return NextResponse.json({ error: 'Event already resolved' }, { status: 400 });

        // 2. Mark Event as Completed (LOCK - Prevents New Bets)
        const { error: updateError } = await supabaseGame
            .from('prediction_events')
            .update({
                status: 'resolved',
                winner: winner
            })
            .eq('id', event_id);

        if (updateError) throw updateError;

        // 3. Re-Fetch FINAL State (Includes bets made just before lock)
        const { data: finalEvent } = await supabaseGame
            .from('prediction_events')
            .select('*')
            .eq('id', event_id)
            .single();

        if (!finalEvent) throw new Error("Failed to verify event closure");

        // 4. Calculate Pools from FINAL State
        const totalPool = (Number(finalEvent.pool_1) || 0) + (Number(finalEvent.pool_2) || 0);
        const winningPool = winner === 'option_1' ? (Number(finalEvent.pool_1) || 0) : (Number(finalEvent.pool_2) || 0);

        // 5. Distribute Winnings
        let processedCount = 0;
        let refundMode = false;

        // REFUND LOGIC: If nobody bet on the winner, REFUND EVERYONE
        if (winningPool === 0 && totalPool > 0) {
            refundMode = true;
            // Fetch ALL bets to refund
            const { data: allBets } = await supabaseGame
                .from('prediction_bets')
                .select('*')
                .eq('event_id', event_id);

            if (allBets && allBets.length > 0) {
                // Parallelize updates for speed
                await Promise.all(allBets.map(async (bet: any) => {
                    // Refund to Wallet (Main)
                    await supabase.rpc('increment_user_coins', {
                        u_id: bet.user_id,
                        amount: bet.amount
                    });

                    // Log Transaction (Main)
                    await supabase.from('transactions').insert({
                        user_id: bet.user_id,
                        amount: bet.amount,
                        type: 'refund',
                        description: `REFUND: ${finalEvent.title} (No Winners)`
                    });

                    // Update Bet Status (Game)
                    await supabaseGame
                        .from('prediction_bets')
                        .update({ status: 'refunded', payout: bet.amount })
                        .eq('id', bet.id);

                    processedCount++;
                }));
            }

            return NextResponse.json({
                success: true,
                message: `Event refunded (No winners). processed: ${processedCount}`
            });
        }

        // STANDARD PAYOUT LOGIC
        if (winningPool > 0) {
            const { data: winningBets } = await supabaseGame
                .from('prediction_bets')
                .select('*')
                .eq('event_id', event_id)
                .eq('choice', winner);

            if (winningBets && winningBets.length > 0) {
                // Parallel Processing
                await Promise.all(winningBets.map(async (bet: any) => {
                    const share = Number(bet.amount) / winningPool;
                    const payout = Math.floor(share * totalPool);

                    if (payout > 0) {
                        try {
                            // A. Credit User Wallet (Main DB) - using RPC for atomicity if available, else update
                            const { error: walletError } = await supabase.rpc('increment_user_coins', {
                                u_id: bet.user_id,
                                amount: payout
                            });

                            // Fallback if RPC missing
                            if (walletError) {
                                const { data: profile } = await supabase.from('profiles').select('coins').eq('id', bet.user_id).single();
                                if (profile) {
                                    await supabase.from('profiles').update({ coins: profile.coins + payout }).eq('id', bet.user_id);
                                }
                            }

                            // B. Log Transaction (Main DB)
                            await supabase.from('transactions').insert({
                                user_id: bet.user_id,
                                amount: payout,
                                type: 'win',
                                description: `WIN: ${finalEvent.title} (${Number(bet.amount)} -> ${payout})`
                            });

                            // C. Update Bet Status (Game DB)
                            await supabaseGame
                                .from('prediction_bets')
                                .update({ status: 'won', payout: payout })
                                .eq('id', bet.id);

                            processedCount++;
                        } catch (err) {
                            console.error(`Failed to process payout for bet ${bet.id}`, err);
                        }
                    }
                }));
            }
        }

        // 6. Mark Losers
        const loserOption = winner === 'option_1' ? 'option_2' : 'option_1';
        const { error: loserError } = await supabaseGame
            .from('prediction_bets')
            .update({ status: 'lost', payout: 0 })
            .eq('event_id', event_id)
            .eq('choice', loserOption);

        if (loserError) console.error("Error marking losers:", loserError);

        return NextResponse.json({
            success: true,
            message: `Event resolved. Winners Paid: ${processedCount}. Pool: ${totalPool}`
        });

    } catch (error: any) {
        console.error("Resolution Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
