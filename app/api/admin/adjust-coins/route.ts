import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const adminId = request.headers.get('x-user-id');
        if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // VERIFY ADMIN PRIVILEGES
        const { data: profile, error: profileError } = await supabaseMain
            .from('profiles')
            .select('is_admin')
            .eq('id', adminId)
            .single();

        if (profileError || !profile?.is_admin) {
            return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
        }

        const { userId, amount } = await request.json();

        // 1. Update user coins using RPC for atomicity
        const { error: updateError } = await supabaseMain.rpc('increment_user_coins', {
            u_id: userId,
            amount: parseInt(amount)
        });

        if (updateError) throw updateError;

        // 2. Log transaction
        await supabaseMain
            .from('transactions')
            .insert([{
                user_id: userId,
                amount: parseInt(amount),
                type: 'admin_tweak',
                description: `Manual adjustment by administrator #${adminId.substring(0, 5)}`
            }]);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
