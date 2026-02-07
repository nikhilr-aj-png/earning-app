import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { upiId } = await req.json();

        if (!upiId || typeof upiId !== 'string' || !upiId.includes('@')) {
            return NextResponse.json({ error: 'Invalid UPI ID format' }, { status: 400 });
        }

        // Fetch current profile
        const { data: profile, error: fetchError } = await supabaseMain
            .from('profiles')
            .select('upi_id, new_upi_id')
            .eq('id', userId)
            .single();

        if (fetchError || !profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Logic:
        // 1. If upi_id is NULL -> First time setup -> Instant Update
        // 2. If upi_id exists -> Change Request -> Set new_upi_id & timestamp

        if (!profile.upi_id) {
            // First time: Instant Lock
            const { error: updateError } = await supabaseMain
                .from('profiles')
                .update({ upi_id: upiId, upi_request_date: null, new_upi_id: null }) // Ensure clean state
                .eq('id', userId);

            if (updateError) throw updateError;
            return NextResponse.json({ success: true, message: 'UPI ID Linked Successfully', mode: 'instant' });
        } else {
            // Change Request: Admin Approval Required
            const { error: updateError } = await supabaseMain
                .from('profiles')
                .update({
                    new_upi_id: upiId,
                    upi_request_date: new Date().toISOString()
                })
                .eq('id', userId);

            if (updateError) throw updateError;
            return NextResponse.json({ success: true, message: 'UPI Change Request Sent for Approval', mode: 'pending' });
        }

    } catch (error: any) {
        console.error('UPI Update Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
