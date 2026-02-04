import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function GET(request: Request) {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: tasks, error } = await supabaseMain
        .from('tasks')
        .select('*')
        .order('reward', { ascending: false });

    if (error) {
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    return NextResponse.json(tasks);
}
