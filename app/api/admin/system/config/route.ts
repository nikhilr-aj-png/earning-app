import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Verify Admin Status
        const { data: user } = await supabaseAdmin
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();

        if (!user || !user.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updates = await req.json();

        // Update settings
        const { data, error } = await supabaseAdmin
            .from('system_settings')
            .update(updates)
            .eq('id', 1)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'SYSTEM CONFIG UPDATED', data });

    } catch (error: any) {
        console.error("System Config Update Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
