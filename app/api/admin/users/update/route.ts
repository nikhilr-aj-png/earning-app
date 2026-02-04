import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const adminId = req.headers.get('x-user-id');
        if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 1. VERIFY ADMIN PRIVILEGES
        const { data: adminProfile, error: adminError } = await supabaseMain
            .from('profiles')
            .select('is_admin')
            .eq('id', adminId)
            .single();

        if (adminError || !adminProfile?.is_admin) {
            return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
        }

        const { userId, updates, action } = await req.json();

        // 2. VERIFY TARGET IS NOT AN ADMIN (Immunity Check)
        const { data: targetProfile, error: targetError } = await supabaseMain
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();

        if (targetError) throw targetError;
        if (targetProfile.is_admin) {
            return NextResponse.json({ error: 'ADMINISTRATIVE IMMUNITY ACTIVE. TARGET UNTOUCHABLE.' }, { status: 403 });
        }

        // 3. PERFORM PROTECTED OPERATIONS

        // Handle ACCOUNT PURGE (Delete)
        if (action === 'delete') {
            const { error: pDeleteError } = await supabaseMain.from('profiles').delete().eq('id', userId);
            if (pDeleteError) throw pDeleteError;
            return NextResponse.json({ success: true, message: 'USER IDENTITY PURGED FROM DATABASE' });
        }

        // Handle METADATA UPDATES (Name, Coins, Premium, Blocked)
        if (updates) {
            const { error } = await supabaseMain
                .from('profiles')
                .update({
                    name: updates.name,
                    coins: updates.coins,
                    is_premium: updates.is_premium,
                    is_blocked: updates.is_blocked,
                    premium_until: updates.is_premium ? (updates.premium_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()) : null
                })
                .eq('id', userId);

            if (error) throw error;
            return NextResponse.json({ success: true, message: 'USER IDENTITY SYNCHRONIZED SUCCESSFULLY' });
        }

        return NextResponse.json({ error: 'Invalid protocol request' }, { status: 400 });

    } catch (error: any) {
        console.error('User Update Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
