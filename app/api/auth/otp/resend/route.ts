import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { email, type } = await req.json();

        if (!email || !type) throw new Error("Email and type are required");

        let error;
        if (type === 'recovery') {
            // Re-trigger the forgot password flow to send a new OTP
            const { error: resendError } = await supabaseMain.auth.resetPasswordForEmail(email);
            error = resendError;
        } else {
            // Standard resend for signup/email_change
            const { error: resendError } = await supabaseMain.auth.resend({
                type: type as any,
                email,
            });
            error = resendError;
        }

        if (error) throw error;

        return NextResponse.json({ success: true, message: "OTP RESENT." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
