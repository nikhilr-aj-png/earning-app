import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function GET(request: Request) {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: user, error } = await supabaseMain
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Lazy Generate Referral Code if missing
    if (!user.referral_code) {
        const generatedCode = 'EF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const { data: updatedUser, error: updateError } = await supabaseMain
            .from('profiles')
            .update({ referral_code: generatedCode })
            .eq('id', userId)
            .select()
            .single();

        if (!updateError && updatedUser) {
            return NextResponse.json(updatedUser);
        }
    }

    return NextResponse.json(user);
}
