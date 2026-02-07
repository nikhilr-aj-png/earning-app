import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { email, token, name, referralCode } = await req.json();

        // 1. Verify OTP for Signup
        const { data: authData, error: authError } = await supabaseMain.auth.verifyOtp({
            email,
            token,
            type: 'signup', // Change to signup for password-based verification
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
            // Get metadata sent during signup
            const metadata = user.user_metadata || {};

            // New user registration
            const generatedReferralCode = 'EF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            const generatedDisplayId = Math.floor(10000000 + Math.random() * 90000000).toString();

            const { data: newProfile, error: insError } = await supabaseMain
                .from('profiles')
                .insert({
                    id: user.id,
                    email: user.email,
                    name: metadata.full_name || user.email?.split('@')[0],
                    display_id: generatedDisplayId,
                    referral_code: generatedReferralCode,
                    referred_by: metadata.referral_code,
                    coins: 100 // Welcome bonus
                })
                .select()
                .single();

            if (insError) throw insError;
            finalProfile = newProfile;

            // Log welcome transaction for new user
            await supabaseMain.from('transactions').insert({
                user_id: user.id,
                amount: 100,
                type: 'referral',
                description: 'WELCOME BONUS'
            });

            // 3. Credit Referrer
            const referralCodeUsed = metadata.referral_code;
            if (referralCodeUsed) {
                try {
                    const { data: referrer, error: refError } = await supabaseMain
                        .from('profiles')
                        .select('id, coins, is_premium, name')
                        .eq('referral_code', referralCodeUsed)
                        .single();

                    if (referrer && !refError) {
                        const rewardAmount = referrer.is_premium ? 100 : 50;

                        // Update referrer's coins
                        await supabaseMain
                            .from('profiles')
                            .update({ coins: (referrer.coins || 0) + rewardAmount })
                            .eq('id', referrer.id);

                        // Log transaction for referrer
                        await supabaseMain.from('transactions').insert({
                            user_id: referrer.id,
                            amount: rewardAmount,
                            type: 'referral',
                            description: `REFERRAL BONUS | ONBOARDED: ${finalProfile.name}`
                        });
                    }
                } catch (err) {
                    console.error("Referral credit failed:", err);
                    // Don't throw, we don't want to break signup if referral credit fails
                }
            }
        }

        return NextResponse.json({
            id: user.id,
            display_id: finalProfile.display_id,
            email: user.email,
            name: finalProfile.name,
            coins: finalProfile.coins,
            is_admin: finalProfile.is_admin || false,
            is_premium: finalProfile.is_premium || false,
            premium_until: finalProfile.premium_until,
            is_blocked: finalProfile.is_blocked || false
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
