export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseGame } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabaseGame
            .from('prediction_events')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // GROUP BY ROOM: User wants to see a single "Persistent Card" per game room.
        // We filter to keep only the LATEST event for each room_id.
        const roomMap = new Map();

        data?.forEach((event: any) => {
            // Use room_id as key, fallback to id for legacy games
            const key = event.room_id || event.id;

            if (!roomMap.has(key)) {
                roomMap.set(key, event);
            } else {
                // If we already have an entry, check if current is newer (though query is ordered desc, so first hit is newest)
                // Since we order by created_at DESC, the first one we encounter IS the latest.
                // So we just ignore subsequent ones.
            }
        });

        return NextResponse.json(Array.from(roomMap.values()));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
