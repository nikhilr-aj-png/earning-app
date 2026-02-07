import { NextResponse } from 'next/server';
import { supabaseMain, supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile, error: profileError } = await supabaseMain
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();

        if (profileError || !profile?.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data: tasks, error } = await supabaseAdmin
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch completion counts
        const { data: allCompletions } = await supabaseAdmin
            .from('transactions')
            .select('description')
            .eq('type', 'earn')
            .ilike('description', '%[CLAIMED:%');

        const tasksWithStats = tasks.map((task: any) => {
            const count = allCompletions?.filter((tx: any) =>
                tx.description.includes(`[CLAIMED:${task.id}]`)
            ).length || 0;
            return { ...task, completion_count: count };
        });

        return NextResponse.json(tasksWithStats);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile, error: profileError } = await supabaseMain
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();

        if (profileError || !profile?.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { title, reward, type, url, cooldown, target_audience, expiry_time, expiry_hours, questions } = await request.json();
        const id = 't' + Date.now();

        let expires_at: string;
        if (expiry_time) {
            const [hours, minutes] = expiry_time.split(':').map(Number);
            const now = new Date();
            const date = new Date();
            date.setHours(hours, minutes, 0, 0);

            // If the time has already passed today, set it for tomorrow
            if (date <= now) {
                date.setDate(date.getDate() + 1);
            }
            expires_at = date.toISOString();
        } else {
            expires_at = new Date(Date.now() + (expiry_hours || 24) * 60 * 60 * 1000).toISOString();
        }

        const { data, error } = await supabaseMain
            .from('tasks')
            .insert([{ title, reward, type, url, cooldown, target_audience, expires_at, questions }])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile, error: profileError } = await supabaseMain
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();

        if (profileError || !profile?.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        console.log(`ADMIN: Manual Deletion Triggered for Task ID: ${id}`);

        const { error } = await supabaseAdmin
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile, error: profileError } = await supabaseMain
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();

        if (profileError || !profile?.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id, ...updates } = await request.json();
        if (!id) return NextResponse.json({ error: 'Task ID required' }, { status: 400 });

        // Handle expiry_time if provided
        if (updates.expiry_time) {
            const [hours, minutes] = updates.expiry_time.split(':').map(Number);
            const now = new Date();
            const date = new Date();
            date.setHours(hours, minutes, 0, 0);
            if (date <= now) date.setDate(date.getDate() + 1);
            updates.expires_at = date.toISOString();
            delete updates.expiry_time;
        }

        const { data, error } = await supabaseMain
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
