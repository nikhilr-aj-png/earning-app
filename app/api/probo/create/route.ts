import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { question, category, end_time } = await request.json();

        const { data, error } = await supabaseMain
            .from('probo_events')
            .insert([{
                question,
                category: category || 'General',
                end_time: end_time || new Date(Date.now() + 86400000).toISOString(),
                status: 'active'
            }])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
