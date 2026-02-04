import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        // In a real app, we'd check for admin role here
        const userId = request.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 1. Total User Count
        const { count: totalUsers, error: userError } = await supabaseMain
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (userError) throw userError;

        // 2. Total Coins Distributed
        const { data: coinsData, error: coinsError } = await supabaseMain
            .from('profiles')
            .select('coins');

        if (coinsError) throw coinsError;

        const totalCoinsDistributed = coinsData.reduce((acc, curr) => acc + (Number(curr.coins) || 0), 0);

        // 3. Count Tasks
        const { count: totalTasks, error: taskError } = await supabaseMain
            .from('tasks')
            .select('*', { count: 'exact', head: true });

        return NextResponse.json({
            totalUsers: totalUsers || 0,
            totalCoinsDistributed,
            totalTasks: totalTasks || 0,
            activeDaily: Math.floor((totalUsers || 0) * 0.4) // Mocked active ratio for now
        });

    } catch (error: any) {
        console.error('Admin Stats Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
