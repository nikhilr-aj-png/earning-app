import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function GET(request: Request) {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabaseMain
        .from('profiles')
        .select('is_premium')
        .eq('id', userId)
        .single();

    // Use a 15-minute buffer for clock drift across systems
    const now = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    let query = supabaseMain
        .from('tasks')
        .select('*')
        .gt('expires_at', now)
        .order('created_at', { ascending: false });

    // Filter by audience
    if (profile?.is_premium) {
        // Premium users see everything (free + premium)
        query = query.in('target_audience', ['free', 'premium']);
    } else {
        // Free users only see 'free'
        query = query.eq('target_audience', 'free');
    }

    const { data: tasks, error } = await query;

    if (error) {
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    // 4. Check for completions
    const { data: userCompletions } = await supabaseMain
        .from('transactions')
        .select('description, created_at')
        .eq('user_id', userId)
        .eq('type', 'earn')
        .ilike('description', '%[CLAIMED:%');

    const tasksWithStatus = tasks.map((task: any) => {
        const completion = userCompletions?.find(tx => {
            const match = tx.description.match(/\[CLAIMED:([^\]]+)\]/);
            const idMatch = match ? match[1] === task.id : false;
            if (!idMatch) return false;

            // Check if cooldown still applies
            const cooldownHours = task.cooldown ? task.cooldown / 60 : 24;
            const expiryDate = new Date(new Date(tx.created_at).getTime() + cooldownHours * 60 * 60 * 1000);
            return expiryDate > new Date();
        });

        return {
            ...task,
            is_completed: !!completion
        };
    });

    // Sort: Incomplete first, then by created_at
    tasksWithStatus.sort((a, b) => {
        if (a.is_completed === b.is_completed) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return a.is_completed ? 1 : -1;
    });

    return NextResponse.json(tasksWithStatus);
}
