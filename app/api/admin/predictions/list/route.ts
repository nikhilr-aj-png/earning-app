export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseGame } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseGame
            .from('prediction_events')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
