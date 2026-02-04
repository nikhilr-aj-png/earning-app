import { NextResponse } from 'next/server';
import { supabaseMain, supabaseGame } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const { roundId } = await request.json();

        // 1. Get round totals
        const { data: round, error: rErr } = await supabaseGame
            .from('game_rounds')
            .select('*')
            .eq('id', roundId)
            .single();

        if (rErr || round.status !== 'open') throw new Error('Invalid Round');

        // 2. Profit Logic: Least Bet Wins
        const winner = round.total_bet_a <= round.total_bet_b ? 'A' : 'B';

        // 3. Close round
        await supabaseGame
            .from('game_rounds')
            .update({ status: 'finished', winner })
            .eq('id', roundId);

        // 4. Distribute payouts to Project 1
        const { data: winners, error: wErr } = await supabaseGame
            .from('game_bets_live')
            .select('*')
            .eq('round_id', roundId)
            .eq('choice', winner);

        if (winners && winners.length > 0) {
            for (const win of winners) {
                const payout = win.amount * 2; // Flat 2x

                // Update Project 1
                await supabaseMain.rpc('increment_user_coins', {
                    u_id: win.user_id,
                    amount: payout
                });

                // Update Project 2 bet status
                await supabaseGame
                    .from('game_bets_live')
                    .update({ status: 'win', payout })
                    .eq('id', win.id);
            }
        }

        return NextResponse.json({ winner });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
