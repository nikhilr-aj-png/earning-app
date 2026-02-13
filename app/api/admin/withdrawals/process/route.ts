import { NextResponse } from 'next/server';
import { supabaseMain, supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // VERIFY ADMIN (Use Admin client to ensure we can read any profile status)
        const { data: admin, error: adminError } = await supabaseAdmin
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();

        if (adminError || !admin?.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { transactionId, action, rejectionReason } = await req.json(); // action: 'approve' | 'reject'

        if (!transactionId || !action) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Fetch transaction (Use Admin client to bypass RLS)
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
            // Update status to completed
            const { error: updateError } = await supabaseAdmin
                .from('transactions')
                .update({ status: 'completed' })
                .eq('id', transactionId);

            if (updateError) throw updateError;

            return NextResponse.json({ success: true, message: 'Withdrawal Approved' });

        } else if (action === 'reject') {
            const refundAmount = Math.abs(tx.amount);

            // 1. Refund Coins (Use Admin client)
            const { error: refundError } = await supabaseAdmin.rpc('increment_user_coins', {
                u_id: tx.user_id,
                amount: refundAmount
            });

            if (refundError) throw refundError;

            // 2. Update Transaction Status (Use Admin client)
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
