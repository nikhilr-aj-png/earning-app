import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { email, token, name, referralCode } = await req.json();

        // 1. Verify OTP
        const { data: authData, error: authError } = await supabaseMain.auth.verifyOtp({
            email,
            token,
            type: 'email',
        });

        if (authError) throw authError;

        const user = authData.user;
        if (!user) throw new Error("Verification failed");

        // 2. Check/Upsert Profile (Handling Registration logic)
        const { data: profile, error: pError } = await supabaseMain
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        let finalProfile = profile;

        if (!profile) {
            // New user registration
            const { data: newProfile, error: insError } = await supabaseMain
                .from('profiles')
                .insert({
                    id: user.id,
                    email: user.email,
                    name: name || user.email?.split('@')[0],
                    referred_by: referralCode,
                    coins: 100 // Welcome bonus
                })
                .select()
                .single();

            if (insError) throw insError;
            finalProfile = newProfile;

            // Log welcome transaction
            await supabaseMain.from('transactions').insert({
                user_id: user.id,
                amount: 100,
                type: 'referral',
                description: 'WELCOME BONUS'
            });
        }

        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: finalProfile.name,
            coins: finalProfile.coins
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
