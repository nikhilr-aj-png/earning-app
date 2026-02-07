export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseGame } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: games, error } = await supabaseGame
            .from('games')
            .select('*')
            .eq('status', 'active')
            .order('priority', { ascending: false });

        if (error) throw error;

        return NextResponse.json(games);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
