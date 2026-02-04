import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        // 1. Sign In with Password
        const { data: authData, error: authError } = await supabaseMain.auth.signInWithPassword({
            email,
            password
        });

        if (authError) throw authError;

        const user = authData.user;
        if (!user) throw new Error("Login failed");

        // 2. Fetch Profile
        const { data: profile, error: pError } = await supabaseMain
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (pError || !profile) throw new Error("Profile not found");

        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: profile.name,
            coins: profile.coins,
            is_admin: profile.is_admin || false,
            is_premium: profile.is_premium || false,
            premium_until: profile.premium_until,
            is_blocked: profile.is_blocked || false
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
