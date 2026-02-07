import { NextResponse } from 'next/server';
import { supabaseMain, supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabaseMain
        .from('profiles')
        .select('is_premium, is_admin')
        .eq('id', userId)
        .single();

    // Instant expiry check
    const now = new Date().toISOString();
    let query = supabaseMain
        .from('tasks')
        .select('*')
        .gt('expires_at', now)
        .order('created_at', { ascending: false });

    const { data: tasks, error } = await query;

    if (error) {
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    const { data: userCompletions } = await supabaseAdmin
        .from('transactions')
        .select('description, created_at, amount')
        .eq('user_id', userId)
        .ilike('description', '%[CLAIMED:%');

    const tasksWithStatus = tasks.map((task: any) => {
        // A task is locked if it's premium and the user is NOT premium AND NOT admin
        const isLocked = task.target_audience === 'premium' && !profile?.is_premium && !profile?.is_admin;

        const completion = userCompletions?.find((tx: any) => {
            const match = tx.description.match(/\[CLAIMED:([^\]]+)\]/);
            return match ? match[1] === task.id : false;
        });

        return {
            ...task,
            is_completed: !!completion,
            is_locked: isLocked,
            earned_amount: completion?.amount || 0
        };
    });

    // Sort: Incomplete first, then by created_at
    tasksWithStatus.sort((a: any, b: any) => {
        if (a.is_completed === b.is_completed) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return a.is_completed ? 1 : -1;
    });

    return NextResponse.json(tasksWithStatus);
}
