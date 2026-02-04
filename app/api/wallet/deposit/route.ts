import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { amountRupees } = await req.json();

        if (!amountRupees || amountRupees <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        // 10:1 Ratio -> coins = rupees * 10
        const coinsToAdd = amountRupees * 10;

        // 1. Update user coins using RPC
        const { error: updateError } = await supabaseMain.rpc('increment_user_coins', {
            u_id: userId,
            amount: coinsToAdd
        });

        if (updateError) throw updateError;

        // 2. Log Transaction
        const { error: txError } = await supabaseMain.from('transactions').insert({
            user_id: userId,
            amount: coinsToAdd,
            type: 'deposit',
            description: `LIQUIDITY INJECTION (₹${amountRupees})`
        });

        if (txError) throw txError;

        return NextResponse.json({
            success: true,
            coinsAdded: coinsToAdd,
            message: `PROTOCOL SYNCED. ₹${amountRupees} INJECTED AS ${coinsToAdd} FLOW.`
        });

    } catch (error: any) {
        console.error('Deposit Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
