import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
    try {
        const userId = '99420d91-f8dc-4fe6-9f6e-43e6cc10c409';
        console.log(`Force Delete Real: Attempting to remove ${userId}`);

        const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (error) {
            return NextResponse.json({ status: 'error', error: error.message, fullError: error }, { status: 200 });
        }

        return NextResponse.json({
            status: 'success',
            message: 'User successfully deleted from Auth.',
            data
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ status: 'limit_error', error: error.message }, { status: 200 });
    }
}
