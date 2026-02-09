import { NextRequest, NextResponse } from 'next/server';
import { supabaseGame, supabaseMain } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user's prediction bets with event details
        const { data: bets, error } = await supabaseGame
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
            .order('created_at', { ascending: false })
            .limit(30);

        if (error) throw error;

        // Filter only resolved games for history
        const resolvedBets = (bets || []).filter((bet: any) =>
            bet.prediction_events?.status === 'resolved'
        );

        return NextResponse.json(resolvedBets);
    } catch (error: any) {
        console.error('Error fetching bet history:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
