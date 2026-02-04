import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: events, error } = await supabaseMain
            .from('probo_events')
            .select('*')
            .eq('status', 'active')
            .order('end_time', { ascending: true });

        if (error) throw error;
        return NextResponse.json(events);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
