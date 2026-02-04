import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        // 1. Supabase Auth Login
        const { data: authData, error: authError } = await supabaseMain.auth.signInWithPassword({
            email,
            password,
        });

        if (authError || !authData.user) {
            return NextResponse.json({ error: authError?.message || 'Invalid credentials' }, { status: 401 });
        }

        // 2. Fetch User Profile
        const { data: profile, error: profileError } = await supabaseMain
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (profileError) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
