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

        const { userId, action } = await req.json();

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

        // 3. PERFORM ACTION
        if (action === 'block') {
            const { error } = await supabaseMain.from('profiles').update({ is_blocked: true }).eq('id', userId);
            if (error) throw error;
            return NextResponse.json({ success: true, message: 'USER ACCESS TERMINATED (BLOCKED)' });
        }

        if (action === 'unblock') {
            const { error } = await supabaseMain.from('profiles').update({ is_blocked: false }).eq('id', userId);
            if (error) throw error;
            return NextResponse.json({ success: true, message: 'USER ACCESS RESTORED' });
        }

        if (action === 'delete') {
            // Delete from profiles (auth user deletion usually requires admin SDK or manual cleanup in Supabase)
            // For now, we delete the profile record
            const { error: pDeleteError } = await supabaseMain.from('profiles').delete().eq('id', userId);
            if (pDeleteError) throw pDeleteError;

            return NextResponse.json({ success: true, message: 'USER IDENTITY PURGED FROM DATABASE' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('User Control Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
