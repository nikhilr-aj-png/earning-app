import { NextResponse } from 'next/server';
import { supabaseGame } from '@/lib/supabase';

export async function GET() {
    try {
        // Find the active round
        let { data: round, error } = await supabaseGame
            .from('game_rounds')
            .select('*')
            .eq('status', 'open')
            .single();

        // If no round, create one (simplification for MVP)
        if (!round) {
            const { data: newRound, error: createError } = await supabaseGame
                .from('game_rounds')
                .insert([{ game_type: 'aviator', status: 'open' }])
                .select()
                .single();
            if (createError) throw createError;
            round = newRound;
        }

        return NextResponse.json(round);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
