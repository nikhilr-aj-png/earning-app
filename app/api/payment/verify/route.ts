import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseMain } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            userId,
            type, // 'premium' or 'coins'
            amount // in rupees
        } = await req.json();

        // 1. Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
        }

        if (type === 'premium') {
            // 2. Update User Status to Premium (30 DAYS)
            const premiumUntil = new Date();
            premiumUntil.setDate(premiumUntil.getDate() + 30);

            const { error: updateError } = await supabaseMain
                .from('profiles')
                .update({
                    is_premium: true,
                    premium_until: premiumUntil.toISOString()
                })
                .eq('id', userId);

            if (updateError) throw updateError;

            // 3. Log Transaction
            await supabaseMain.from('transactions').insert({
                user_id: userId,
                amount: 99,
                type: 'premium_upgrade',
                status: 'completed',
                description: 'MONTHLY ELITE ACCESS ACTIVATED'
            });

            return NextResponse.json({ success: true, message: "Payment verified and account upgraded" });
        } else if (type === 'coins') {
            // 2. Add FLOW Coins (10:1 Ratio)
            const coinsToAdd = amount * 10;

            const { error: updateError } = await supabaseMain.rpc('increment_user_coins', {
                u_id: userId,
                amount: coinsToAdd
            });

            if (updateError) throw updateError;

            // 3. Log Transaction
            await supabaseMain.from('transactions').insert({
                user_id: userId,
                amount: coinsToAdd,
                type: 'deposit',
                status: 'completed',
                description: `LIQUIDITY INJECTION (₹${amount})`
            });

            return NextResponse.json({ success: true, message: `PROTOCOL SYNCED. ₹${amount} INJECTED AS ${coinsToAdd} FLOW.` });
        }

        return NextResponse.json({ error: "Invalid Protocol Type" }, { status: 400 });

    } catch (error: any) {
        console.error("Verification Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
