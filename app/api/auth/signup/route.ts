import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { email, password, name, referralCode } = await req.json();

        // 1. Sign Up in Supabase Auth (Sends OTP automatically if configured)
        const { data, error } = await supabaseMain.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    referral_code: referralCode
                }
            }
        });

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Verification OTP sent to email" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
