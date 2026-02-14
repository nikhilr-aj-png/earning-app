import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const { email, password, name, referralCode } = await request.json();

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Supabase Auth Sign Up
        const { data: authData, error: authError } = await supabaseMain.auth.signUp({
            email,
            password,
        });

        if (authError || !authData.user) {
            return NextResponse.json({ error: authError?.message || 'Registration failed' }, { status: 400 });
        }

        const userId = authData.user.id;
        const generatedReferralCode = 'EF-' + Math.random().toString(36).substring(2, 8).toUpperCase();

        // 2. Create Profile in Project 1
        const { data: profile, error: profileError } = await supabaseMain
            .from('profiles')
            .insert([
                {
                    id: userId,
                    email: email,
                    name: name,
                    coins: 100,
                    referral_code: generatedReferralCode,
                    referred_by: referralCode?.trim()?.toUpperCase()
                }
            ])
            .select()
            .single();

        if (profileError) {
            console.error('Profile creation error:', profileError);
            return NextResponse.json({ error: 'Profile creation failed' }, { status: 500 });
        }

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
