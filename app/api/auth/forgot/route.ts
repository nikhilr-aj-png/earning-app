import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) throw new Error("Email is required");

        const { error } = await supabaseMain.auth.resetPasswordForEmail(email);

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Recovery code transmitted." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
