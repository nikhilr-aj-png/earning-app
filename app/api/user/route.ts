import { NextResponse } from 'next/server';
import { supabaseMain, supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: user, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update last_seen timestamp (Activity Heartbeat) - Throttled to 60s
    const lastSeen = user.last_seen ? new Date(user.last_seen).getTime() : 0;
    const now = Date.now();
    if (now - lastSeen > 60000) {
        await supabaseAdmin
            .from('profiles')
            .update({ last_seen: new Date().toISOString() })
            .eq('id', userId);
    }

    // Lazy Generate Referral Code if missing
    if (!user.referral_code) {
        const generatedCode = 'EF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        await supabaseAdmin
            .from('profiles')
            .update({ referral_code: generatedCode })
            .eq('id', userId);
    }

    // Lazy Generate 8-digit Display ID if missing
    if (!user.display_id) {
        const generatedId = Math.floor(10000000 + Math.random() * 90000000).toString();
        const { data: updatedUser, error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ display_id: generatedId })
            .eq('id', userId)
            .select()
            .single();

        if (!updateError && updatedUser) {
            return NextResponse.json(updatedUser);
        }
    }

    return NextResponse.json(user);
}
