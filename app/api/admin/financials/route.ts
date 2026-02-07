export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // VERIFY ADMIN PRIVILEGES
        const { data: profile, error: profileError } = await supabaseMain
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();

        if (profileError || !profile?.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 1. Calculate Total Revenue (Premium + Deposits)
        // Premium: Count of 'premium_upgrade' * 99
        // Deposits: Sum of amount from 'deposit' transactions (amount is flow coins, so flow/10 = rupees)
        // Actually, we store 'amount' in 'transactions' table. 
        // For premium, amount is 99 (rupees).
        // For deposit, amount is COINS (e.g. 1000). 1000 coins = 100 rupees.
        // Wait, in verify/route.ts: 
        // Premium: amount: 99
        // Deposit: amount: coinsToAdd (e.g. 1000).
        // So we need to sum premium amounts directly.
        // And sum deposit amounts and divide by 10.

        const { data: premiums, error: premError } = await supabaseMain
            .from('transactions')
            .select('amount')
            .eq('type', 'premium_upgrade');

        if (premError) throw premError;
        const premiumRevenue = premiums.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);

        const { data: deposits, error: depError } = await supabaseMain
            .from('transactions')
            .select('amount')
            .eq('type', 'deposit');

        if (depError) throw depError;
        // Deposits are stored as COINS. 10 Coins = 1 Rupee.
        const depositRevenue = deposits.reduce((acc: number, curr: any) => acc + ((curr.amount || 0) / 10), 0);

        const totalRevenue = premiumRevenue + depositRevenue;
        const totalCoinsDistributed = deposits.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);

        // 2. Fetch Pending Withdrawals
        const { data: withdrawals, error: wdError } = await supabaseMain
            .from('transactions')
            .select('*, profiles(name, email)')
            .eq('type', 'withdraw')
            .order('created_at', { ascending: false });

        if (wdError) throw wdError;

        // 3. Fetch Pending UPI Requests
        const { data: upiRequests, error: upiError } = await supabaseMain
            .from('profiles')
            .select('id, name, email, upi_id, new_upi_id, upi_request_date')
            .not('new_upi_id', 'is', null)
            .order('upi_request_date', { ascending: false });

        if (upiError) throw upiError;

        return NextResponse.json({
            stats: {
                totalRevenue,
                premiumRevenue,
                depositRevenue,
                totalCoinsDistributed
            },
            withdrawals: withdrawals || [],
            upiRequests: upiRequests || []
        });

    } catch (error: any) {
        console.error('Financials Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
