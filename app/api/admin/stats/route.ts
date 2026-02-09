export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        // In a real app, we'd check for admin role here
        const userId = request.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // VERIFY ADMIN PRIVILEGES
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();

        if (profileError || !profile?.is_admin) {
            return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
        }

        // 1. Total User Count
        const { count: totalUsers, error: userError } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (userError) throw userError;

        // 2. Total Coins Distributed
        const { data: coinsData, error: coinsError } = await supabaseAdmin
            .from('profiles')
            .select('coins');

        if (coinsError) throw coinsError;

        const totalCoinsDistributed = coinsData.reduce((acc: number, curr: any) => acc + (Number(curr.coins) || 0), 0);

        // 3. Count Tasks
        const { count: totalTasks, error: taskError } = await supabaseAdmin
            .from('tasks')
            .select('*', { count: 'exact', head: true });

        // 4. Pending Withdrawals
        const { count: pendingWithdrawals, error: wdError } = await supabaseAdmin
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('type', 'withdraw')
            .eq('status', 'pending');

        // 5. Pending UPI Changes
        const { count: pendingUpiChanges, error: upiError } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .not('new_upi_id', 'is', null)
            .neq('new_upi_id', '');

        return NextResponse.json({
            totalUsers: totalUsers || 0,
            totalCoinsDistributed,
            totalTasks: totalTasks || 0,
            pendingWithdrawals: pendingWithdrawals || 0,
            pendingUpiChanges: pendingUpiChanges || 0,
            activeDaily: Math.floor((totalUsers || 0) * 0.4) // Mocked active ratio
        });

    } catch (error: any) {
        console.error('Admin Stats Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
