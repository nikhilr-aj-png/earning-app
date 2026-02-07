export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseGame } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Defaults if not provided
        const {
            question = "Which card winner?",
            option_1_image = "/assets/cards/king.png",
            option_2_image = "/assets/cards/queen.png",
            min_bet = 10,
            target_audience = "all",
            expiry_minutes = 60, // Default 1 hour
            resolution_method = "auto"
        } = body;

        // Calculate Expiry Timestamp
        const expires_at = new Date(Date.now() + expiry_minutes * 60 * 1000).toISOString();

        const { data, error } = await supabaseGame
            .from('prediction_events')
            .insert([{
                question,
                option_1_image,
                option_2_image,
                min_bet,
                target_audience,
                expires_at,
                resolution_method
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, event: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
