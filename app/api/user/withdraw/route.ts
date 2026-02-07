import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { flowAmount } = await req.json();

        if (!flowAmount || flowAmount < 5000) {
            return NextResponse.json({ error: 'Minimum withdrawal is 5,000 FLOW' }, { status: 400 });
        }

        // 1. Check User Balance
        const { data: user, error: userError } = await supabaseMain
            .from('profiles')
            .select('coins')
            .eq('id', userId)
            .single();

        if (userError || !user) throw new Error("User data not found");

        if (user.coins < flowAmount) {
            return NextResponse.json({ error: 'Insufficient FLOW balance' }, { status: 400 });
        }

        // 2. Deduct coins (negative amount)
        const { error: updateError } = await supabaseMain.rpc('increment_user_coins', {
            u_id: userId,
            amount: -flowAmount
        });

        if (updateError) throw updateError;

        // 3. Log Transaction
        const { error: txError } = await supabaseMain.from('transactions').insert({
            user_id: userId,
            amount: -flowAmount,
            type: 'withdraw',
            status: 'pending',
            description: `WITHDRAWAL REQUEST (₹${flowAmount / 10})`
        });

        if (txError) throw txError;

        return NextResponse.json({
            success: true,
            message: `WITHDRAWAL INITIATED. ₹${flowAmount / 10} will be processed.`,
            amount: flowAmount
        });

    } catch (error: any) {
        console.error('Withdrawal Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
