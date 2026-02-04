import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function GET(request: Request) {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: user, error } = await supabaseMain
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
}
