import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        const { error } = await supabaseMain.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
            }
        });

        if (error) throw error;
        return NextResponse.json({ success: true, message: "OTP sent" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
