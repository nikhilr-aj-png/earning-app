
import { NextResponse } from 'next/server';
import { supabaseGameAdmin, supabaseGame } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    const now = new Date();

    // 1. Get Active Games (Using Admin to see everything)
    const { data: active } = await supabaseGameAdmin
        .from('prediction_events')
        .select('*')
        .eq('status', 'active');

    // 2. Get Last Resolved (Using Admin)
    const { data: resolved } = await supabaseGameAdmin
        .from('prediction_events')
        .select('*')
        .eq('status', 'resolved')
        .order('created_at', { ascending: false })
        .limit(5);

    return NextResponse.json({
        server_time: now.toISOString(),
        server_timestamp: now.getTime(),
        active_games: active,
        last_resolved: resolved,
        message: active && active.length > 0
            ? `Active Game Found. Expires in ${(new Date(active[0].expires_at).getTime() - now.getTime()) / 1000}s`
            : "No Active Games. Should Restart."
    });
}
