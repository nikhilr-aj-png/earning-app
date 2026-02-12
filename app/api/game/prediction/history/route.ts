export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseGame, supabaseGameAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const eventId = req.nextUrl.searchParams.get('event_id');

        // Use ADMIN client to bypass RLS policies (since we are server-side and verifying user ID via header)
        // This is critical because normal 'supabaseGame' is anonymous and auth.uid() is null here.
        let query = supabaseGameAdmin
            .from('prediction_bets')
            .select(`
                *,
                prediction_events (
                    question,
                    winning_option,
                    option_1_label,
                    option_2_label,
                    status
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        // Targeted Check: If event_id is provided, filter by it
        if (eventId) {
            query = query.eq('event_id', eventId);
        } else {
            // General History: Limit to 50
            query = query.limit(50);
        }

        const { data: bets, error } = await query;

        if (error) throw error;

        if (error) throw error;

        // Return all bets (Active + Resolved)
        // Client can filter or display status accordingly
        return NextResponse.json(bets);
    } catch (error: any) {
        console.error('Error fetching bet history:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
