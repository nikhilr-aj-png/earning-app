import { supabaseGameAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

const supabase = supabaseGameAdmin;

export async function POST(req: Request) {
    try {
        const { event_id } = await req.json();

        if (!event_id) {
            return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
        }

        // FETCH ROOM ID first
        const { data: targetEvent } = await supabase
            .from('prediction_events')
            .select('room_id')
            .eq('id', event_id)
            .single();

        const roomId = targetEvent?.room_id;

        if (roomId) {
            // DEEP CLEAN: Delete EVERYTHING related to this Room

            // 1. Get all event IDs in this room
            const { data: roomEvents } = await supabase
                .from('prediction_events')
                .select('id') // Fixed: Select only ID
                .eq('room_id', roomId);

            const eventIds = roomEvents?.map((e: any) => e.id) || [event_id]; // Fixed: Typed e

            // 2. Delete ALL bets for these events
            await supabase
                .from('prediction_bets') // Fixed: Ensure table name is correct
                .delete()
                .in('event_id', eventIds);

            // 3. Delete ALL events in the room
            const { error: roomError } = await supabase
                .from('prediction_events')
                .delete()
                .eq('room_id', roomId);

            if (roomError) throw roomError;
        } else {
            // LEGACY DELETE (Single Event)
            await supabase.from('prediction_bets').delete().eq('event_id', event_id);
            const { error: legacyError } = await supabase.from('prediction_events').delete().eq('id', event_id);
            if (legacyError) throw legacyError;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
