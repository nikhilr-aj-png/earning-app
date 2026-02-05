export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseMain, supabaseGame } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const userId = request.headers.get('x-user-id');
        const { roundId, choice, amount } = await request.json();

        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 1. Deduct from Main Profile
        const { data: profile, error: pErr } = await supabaseMain
            .from('profiles')
            .select('coins')
            .eq('id', userId)
            .single();

        if (pErr || profile.coins < amount) throw new Error('Insufficient Funds');

        const { error: uErr } = await supabaseMain
            .from('profiles')
            .update({ coins: profile.coins - amount })
            .eq('id', userId);

        if (uErr) throw uErr;

        // 2. Log Bet in Game Project
        const { data: bet, error: bErr } = await supabaseGame
            .from('game_bets_live')
            .insert([{ user_id: userId, round_id: roundId, choice, amount }])
            .select()
            .single();

        if (bErr) throw bErr;

        // 3. Update Round Totals (Atomic increment)
        const column = choice === 'A' ? 'total_bet_a' : 'total_bet_b';
        await supabaseGame.rpc('increment_round_total', {
            row_id: roundId,
            col_name: column,
            inc_val: amount
        });

        return NextResponse.json(bet);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
