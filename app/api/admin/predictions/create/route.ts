import { NextResponse } from 'next/server';
import { supabaseGameAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Defaults if not provided
        const {
            question = "Which card winner?",
            option_1_label = "KING",
            option_1_image = "/assets/cards/king.png",
            option_2_label = "QUEEN",
            option_2_image = "/assets/cards/queen.png",
            min_bet = 10,
            target_audience = "all",
            expiry_minutes = 60,
            resolution_method = "auto", // Default to AUTO so loop works by default
            bet_mode = "flexible"
        } = body;

        // Calculate Expiry Timestamp
        const expires_at = new Date(Date.now() + expiry_minutes * 60 * 1000).toISOString();

        // Generate a new Room ID for this fresh game series
        const room_id = crypto.randomUUID();

        // ADAPTIVE INSERT: Try with room_id, fallback if column missing
        let data, error;

        try {
            const res = await supabaseGameAdmin
                .from('prediction_events')
                .insert([{
                    room_id,
                    question,
                    option_1_label,
                    option_1_image,
                    option_2_label,
                    option_2_image,
                    min_bet,
                    target_audience,
                    expires_at,
                    resolution_method,
                    bet_mode,
                    status: 'active'
                }])
                .select()
                .single();

            data = res.data;
            error = res.error;

            if (error && error.code === '42703') throw error; // Column missing
        } catch (e) {
            // FALLBACK: Legacy Schema (No room_id)
            const res = await supabaseGameAdmin
                .from('prediction_events')
                .insert([{
                    question,
                    option_1_label,
                    option_1_image,
                    option_2_label,
                    option_2_image,
                    min_bet,
                    target_audience,
                    expires_at,
                    resolution_method,
                    bet_mode,
                    status: 'active'
                }])
                .select()
                .single();
            data = res.data;
            error = res.error;
        }

        if (error) throw error;

        return NextResponse.json({ success: true, event: data });
    } catch (error: any) {
        if (error.code === '23505' || error.message?.includes('one_active_game_constraint')) {
            return NextResponse.json({ error: 'A game is already active. Please wait for it to finish.' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
