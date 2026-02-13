import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    console.log("Processing Withdrawal Request (Manual Mode)...");
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // VERIFY ADMIN
        const { data: admin, error: adminError } = await supabaseAdmin
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();

        if (adminError || !admin?.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { transactionId, action, rejectionReason } = await req.json();

        if (!transactionId || !action) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Fetch transaction
        const { data: tx, error: txFetchError } = await supabaseAdmin
            .from('transactions')
            .select('*')
            .eq('id', transactionId)
            .single();

        if (txFetchError || !tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

        if (tx.status !== 'pending') {
            return NextResponse.json({ error: 'Transaction already processed' }, { status: 400 });
        }

        if (action === 'approve') {
            // Get User details
            const { data: userProfile, error: userError } = await supabaseAdmin
                .from('profiles')
                .select('id, name, email, upi_id')
                .eq('id', tx.user_id)
                .single();

            if (userError || !userProfile) {
                return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
            }

            // Manual Mode Logic Only
            const payoutId = `EF_${Date.now()}`;
            const description = `WITHDRAWAL DISBURSED (₹${tx.amount / -10}) [REF: ${payoutId}]`;

            const { error: updateError } = await supabaseAdmin
                .from('transactions')
                .update({
                    status: 'completed',
                    description: description
                })
                .eq('id', transactionId);

            if (updateError) throw updateError;

            return NextResponse.json({ success: true, message: 'Marked as Paid Manually', payoutId });

        } else if (action === 'reject') {
            const refundAmount = Math.abs(tx.amount);

            // 1. Refund Coins
            const { error: refundError } = await supabaseAdmin.rpc('increment_user_coins', {
                u_id: tx.user_id,
                amount: refundAmount
            });

            if (refundError) throw refundError;

            // 2. Update Transaction Status
            const { error: updateError } = await supabaseAdmin
                .from('transactions')
                .update({
                    status: 'rejected',
                    description: `${tx.description} [REJECTED: ${rejectionReason || 'Admin Action'}]`
                })
                .eq('id', transactionId);

            if (updateError) throw updateError;

            return NextResponse.json({ success: true, message: 'Withdrawal Rejected & Refunded' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('Process Withdrawal Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
