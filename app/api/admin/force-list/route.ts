import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
    try {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers();

        if (error) {
            return NextResponse.json({ status: 'error', error: error.message }, { status: 200 });
        }

        const simplifiedUsers = data.users.map(u => ({
            id: u.id,
            email: u.email
        }));

        return NextResponse.json({
            status: 'success',
            count: simplifiedUsers.length,
            users: simplifiedUsers
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ status: 'error', error: error.message }, { status: 200 });
    }
}
