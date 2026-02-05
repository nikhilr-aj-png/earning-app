import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
    try {
        const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
        const keyLength = process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 0;

        console.log("Diagnostic: Checking Service Role Key...");
        console.log("Diagnostic: Has Key?", hasKey);
        console.log("Diagnostic: Key Length:", keyLength);

        if (!hasKey) {
            return NextResponse.json({
                status: 'error',
                message: 'SUPABASE_SERVICE_ROLE_KEY is missing from environment variables.'
            }, { status: 500 });
        }

        // Test the key by listing users (limit 1)
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 });

        if (error) {
            console.error("Diagnostic: Auth List Error:", error);
            return NextResponse.json({
                status: 'error',
                message: 'Key present but failed to list users.',
                details: error
            }, { status: 500 });
        }

        return NextResponse.json({
            status: 'success',
            message: 'Service Role Key is active and authorized.',
            userCountPreview: data.users.length
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
