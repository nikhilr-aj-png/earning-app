import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // VERIFY ADMIN
        const { data: admin, error: adminError } = await supabaseMain
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();

        if (adminError || !admin?.is_admin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { targetUserId, action } = await req.json(); // action: 'approve' | 'reject'

        if (!targetUserId || !action) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Action Logic
        if (action === 'approve') {
            const { data: targetProfile, error: fetchError } = await supabaseMain
                .from('profiles')
                .select('new_upi_id')
                .eq('id', targetUserId)
                .single();

            if (fetchError || !targetProfile?.new_upi_id) {
                return NextResponse.json({ error: 'No pending UPI request found' }, { status: 404 });
            }

            // Move new_upi_id -> upi_id, and clear request fields
            const { error: updateError } = await supabaseMain
                .from('profiles')
                .update({
                    upi_id: targetProfile.new_upi_id,
                    new_upi_id: null,
                    upi_request_date: null
                })
                .eq('id', targetUserId);

            if (updateError) throw updateError;
            return NextResponse.json({ success: true, message: 'UPI Change Approved' });

        } else if (action === 'reject') {
            // Clear new_upi_id and upi_request_date
            const { error: updateError } = await supabaseMain
                .from('profiles')
                .update({
                    new_upi_id: null,
                    upi_request_date: null
                })
                .eq('id', targetUserId);

            if (updateError) throw updateError;
            return NextResponse.json({ success: true, message: 'UPI Change Rejected' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('Process UPI Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
