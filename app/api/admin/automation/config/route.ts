import { NextResponse } from 'next/server';
import { supabaseMain, supabaseAdmin } from '@/lib/supabase';

const DEFAULT_SETTINGS = {
    is_enabled: false,
    free_task_count: 5,
    premium_task_count: 5,
    free_reward: 50,
    premium_reward: 150,
    exp_h: '11',
    exp_m: '59',
    exp_p: 'PM',
    last_sync: null
};

export async function GET(request: Request) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabaseMain
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();

        if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { data: settings, error } = await supabaseAdmin
            .from('automation_settings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;

        if (!settings) {
            console.log("Config requested but missing. Initializing defaults...");
            const { data: newSettings, error: createError } = await supabaseAdmin
                .from('automation_settings')
                .insert([DEFAULT_SETTINGS])
                .select()
                .single();

            if (createError) throw new Error("Failed to auto-seed configuration: " + createError.message);
            return NextResponse.json(newSettings);
        }

        return NextResponse.json(settings);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabaseMain
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();

        if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const updates = await request.json();

        // Remove internal fields that shouldn't be manually updated
        delete updates.created_at;
        updates.updated_at = new Date().toISOString();

        // Get existing ID if available for specific update, else it will be an upsert
        const { data: existing } = await supabaseAdmin
            .from('automation_settings')
            .select('id')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        const { data, error } = await supabaseAdmin
            .from('automation_settings')
            .upsert({
                ...(existing?.id ? { id: existing.id } : {}),
                ...updates
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
