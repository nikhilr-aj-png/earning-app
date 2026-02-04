import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function GET(request: Request) {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: transactions, error } = await supabaseMain
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }

    return NextResponse.json(transactions);
}
