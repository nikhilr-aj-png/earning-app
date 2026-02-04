import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { email, token, newPassword } = await req.json();

        if (!email || !token || !newPassword) {
            throw new Error("Email, verification code, and new password are required.");
        }

        // 1. Handle the Recovery Verification
        if (token.length > 20) {
            // It's an access_token from the recovery link
            const { error: sessionError } = await supabaseMain.auth.setSession({
                access_token: token,
                refresh_token: token // Dummy or ignored for one-time recovery
            });
            if (sessionError) throw sessionError;
        } else {
            // It's a standard 6-digit OTP code
            const { error: verifyError } = await supabaseMain.auth.verifyOtp({
                email,
                token,
                type: 'recovery',
            });
            if (verifyError) throw verifyError;
        }

        // 2. Update the password
        const { error: updateError } = await supabaseMain.auth.updateUser({
            password: newPassword
        });

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, message: "Protocol updated. Access restored." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
