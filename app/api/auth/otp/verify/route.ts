import { NextResponse } from 'next/server';
import { supabaseMain, supabaseAdmin } from '@/lib/supabase';

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

        // 2. Check/Upsert Profile (Using Admin to bypass RLS)
        const { data: profile, error: pError } = await supabaseAdmin
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

            const { data: newProfile, error: insError } = await supabaseAdmin
                .from('profiles')
                .insert({
                    id: user.id,
                    email: user.email,
                    name: metadata.full_name || name || user.email?.split('@')[0],
                    display_id: generatedDisplayId,
                    referral_code: generatedReferralCode,
                    referred_by: referralCode?.trim()?.toUpperCase() || metadata.referral_code,
                    coins: 100 // Welcome bonus
                })
                .select()
                .single();

            if (insError) throw insError;
            finalProfile = newProfile;

            // Log welcome transaction for new user (With fallback)
            const txPayload = {
                user_id: user.id,
                amount: 100,
                type: 'earn',
                status: 'completed',
                description: 'WELCOME BONUS'
            };

            const { error: txE } = await supabaseAdmin.from('transactions').insert(txPayload);
            if (txE && txE.message.includes('status')) {
                const { status, ...legacyPayload } = txPayload;
                await supabaseAdmin.from('transactions').insert(legacyPayload);
            }
        } else {
            // If profile exists, ensure referralCode is saved if it was missing
            if (!finalProfile.referred_by && referralCode) {
                const { data: updatedProfile } = await supabaseAdmin
                    .from('profiles')
                    .update({ referred_by: referralCode.trim().toUpperCase() })
                    .eq('id', user.id)
                    .select()
                    .single();
                if (updatedProfile) finalProfile = updatedProfile;
            }
        }

        // 3. Credit Referrer (Robust Implementation with Diagnostics)
        const codeFromProfile = finalProfile?.referred_by;
        const codeFromReq = referralCode;
        const effectiveCode = (codeFromProfile || codeFromReq)?.trim()?.toUpperCase();

        const referralDiagnostics: any = {
            effectiveCode,
            isIssued: finalProfile?.referral_reward_issued,
            referrerFound: false,
            error: null
        };

        if (effectiveCode && effectiveCode !== 'NULL' && !finalProfile?.referral_reward_issued) {
            try {
                const { data: referrer, error: refError } = await supabaseAdmin
                    .from('profiles')
                    .select('id, coins, is_premium, name')
                    .eq('referral_code', effectiveCode)
                    .single();

                if (referrer && !refError) {
                    const rewardAmount = referrer.is_premium ? 100 : 50;
                    console.log(`[Referral Progress] Referrer: ${referrer.name} (${referrer.id}), Reward: ${rewardAmount}`);

                    // A. Credit Referrer (Use RPC for robustness)
                    const { error: updError } = await supabaseAdmin.rpc('increment_user_coins', {
                        u_id: referrer.id,
                        amount: rewardAmount
                    });

                    if (updError) console.error(`[Referral Error] Coin Update Failed:`, updError.message);

                    // B. Log Transaction (With Fallback for missing status column)
                    const txPayload = {
                        user_id: referrer.id,
                        amount: rewardAmount,
                        type: 'earn',
                        status: 'completed',
                        description: `[REFERRAL] NEW ONBOARDING: ${finalProfile.name}`
                    };

                    let { error: txError } = await supabaseAdmin.from('transactions').insert(txPayload);

                    // If it failed, try without 'status' column in case SQL wasn't applied
                    if (txError && txError.message.includes('status')) {
                        console.warn("[Referral] Status column missing, falling back to legacy insert");
                        const { status, ...legacyPayload } = txPayload;
                        legacyPayload.type = 'earn';
                        const { error: legacyError } = await supabaseAdmin.from('transactions').insert(legacyPayload);
                        txError = legacyError;
                    }

                    if (txError) referralDiagnostics.error = `Tx Insert: ${txError.message}`;
                    else referralDiagnostics.txResult = 'Success';

                    // C. Mark as Issued & Update Profile back-link
                    const { error: markError } = await supabaseAdmin
                        .from('profiles')
                        .update({
                            referral_reward_issued: true,
                            referred_by: effectiveCode
                        })
                        .eq('id', finalProfile.id);

                    if (markError) console.error(`[Referral Error] Issuance Marking Failed:`, markError.message);

                    finalProfile.referral_reward_issued = true;
                    console.log(`[Referral Success] Reward synced for ${finalProfile.id}`);
                } else if (refError) {
                    console.error(`[Referral Error] Lookup failed for ${effectiveCode}:`, refError.message);
                }
            } catch (err) {
                console.error("[Referral Fatal]:", err);
            }
        }

        return NextResponse.json({
            id: user.id,
            display_id: finalProfile.display_id,
            email: user.email,
            name: finalProfile.name,
            coins: finalProfile.coins,
            is_admin: finalProfile.is_admin || false,
            is_premium: finalProfile?.is_premium || false,
            premium_until: finalProfile?.premium_until,
            is_blocked: finalProfile?.is_blocked || false,
            referral_debug: referralDiagnostics // Diagnostic data
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
