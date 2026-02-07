export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseGame } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseGame
            .from('prediction_events')
            .select('*')
            .eq('status', 'active')
            .gt('expires_at', new Date().toISOString()) // Only future expiry
            .order('expires_at', { ascending: true });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
