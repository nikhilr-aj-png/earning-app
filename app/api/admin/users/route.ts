import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: users, error } = await supabaseMain
            .from('profiles')
            .select('*')
            .order('joined_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(users);
    } catch (error: any) {
        console.error('Admin Users Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
