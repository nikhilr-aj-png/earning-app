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

        // 5. Distribute Winnings (If there are winners)
        let processedCount = 0;

        if (winningPool > 0) {
            // Fetch all winning bets
            const { data: winningBets } = await supabaseGame
                .from('prediction_bets')
                .select('*')
                .eq('event_id', event_id)
                .eq('choice', winner);

            if (winningBets && winningBets.length > 0) {
                // Process Payouts
                for (const bet of winningBets) {
                    // Parimutuel: (UserBet / WinningPool) * TotalPool
                    const share = Number(bet.amount) / winningPool;
                    const payout = Math.floor(share * totalPool);

                    if (payout > 0) {
                        // A. Credit User Wallet (Main DB)
                        const { data: profile } = await supabase.from('profiles').select('coins').eq('id', bet.user_id).single();
                        if (profile) {
                            await supabase.from('profiles').update({ coins: profile.coins + payout }).eq('id', bet.user_id);
                        }

                        // B. Update Bet Status (Game DB)
                        await supabaseGame
                            .from('prediction_bets')
                            .update({ status: 'won', payout: payout })
                            .eq('id', bet.id);

                        processedCount++;
                    }
                }
            }
        }

        // 6. Mark Losers
        const loserOption = winner === 'option_1' ? 'option_2' : 'option_1';
        const { data: losingBets } = await supabaseGame
            .from('prediction_bets')
            .select('id')
            .eq('event_id', event_id)
            .eq('choice', loserOption);

        if (losingBets && losingBets.length > 0) {
            const loserIds = losingBets.map(b => b.id);
            await supabaseGame
                .from('prediction_bets')
                .update({ status: 'lost', payout: 0 })
                .in('id', loserIds);
        }

        return NextResponse.json({
            success: true,
            message: `Event resolved. Winners: ${processedCount}. Pool: ${totalPool}`
        });

    } catch (error: any) {
        console.error("Resolution Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
