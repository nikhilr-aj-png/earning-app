import { NextResponse } from 'next/server';
import { supabaseAdmin, supabaseGame } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const userId = request.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 1. Verify Admin
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();

        if (!profile?.is_admin) return NextResponse.json({ error: 'Limited Access: Admin Only' }, { status: 403 });

        const body = await request.json().catch(() => ({}));
        const { action } = body;

        if (action === 'prune_quizzes') {
            const now = new Date().toISOString();

            // Delete only quizzes that are expired
            const { data, error, count } = await supabaseAdmin
                .from('tasks')
                .delete({ count: 'exact' })
                .eq('type', 'quiz')
                .lt('expires_at', now);

            if (error) throw error;

            return NextResponse.json({
                success: true,
                message: `Successfully pruned ${count || 0} expired quizzes.`,
                count: count || 0
            });
        }

        if (action === 'prune_predictions') {
            // 1. Get all resolved events
            const { data: resolvedEvents, error: fetchError } = await supabaseGame
                .from('prediction_events')
                .select('id')
                .eq('status', 'resolved');

            if (fetchError) throw fetchError;

            if (!resolvedEvents || resolvedEvents.length === 0) {
                return NextResponse.json({ success: true, message: 'No resolved prediction events found.', count: 0 });
            }

            const eventIds = resolvedEvents.map((e: any) => e.id);

            // 2. Delete bets for these events
            const { error: betsError } = await supabaseGame
                .from('prediction_bets')
                .delete()
                .in('event_id', eventIds);

            if (betsError) throw betsError;

            // 3. Delete the events themselves
            const { error: eventsError, count } = await supabaseGame
                .from('prediction_events')
                .delete({ count: 'exact' })
                .in('id', eventIds);

            if (eventsError) throw eventsError;

            return NextResponse.json({
                success: true,
                message: `Succesfully pruned ${count || 0} resolved card games and their associated bets.`,
                count: count || 0
            });
        }

        if (action === 'prune_transactions') {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

            // Delete transactions older than 30 days
            // Note: This is safe because user balances are stored in 'profiles.coins'
            const { data, error, count } = await supabaseAdmin
                .from('transactions')
                .delete({ count: 'exact' })
                .lt('created_at', thirtyDaysAgo);

            if (error) throw error;

            return NextResponse.json({
                success: true,
                message: `Successfully pruned ${count || 0} historical transaction logs older than 30 days.`,
                count: count || 0
            });
        }

        if (action === 'prune_game_history') {
            // 1. Prune 2-Card Game History (supabaseGame)
            const { error: gameHistError, count: gameHistCount } = await supabaseGame
                .from('game_history')
                .delete({ count: 'exact' });

            if (gameHistError) throw gameHistError;

            // 2. Prune Arcade History (supabaseGame)
            // Delete finished rounds and their bets
            const { data: finishedRounds, error: roundsFetchError } = await supabaseGame
                .from('game_rounds')
                .select('id')
                .eq('status', 'finished');

            if (roundsFetchError) throw roundsFetchError;

            let arcadeBetsCount = 0;
            let arcadeRoundsCount = 0;

            if (finishedRounds && finishedRounds.length > 0) {
                const roundIds = finishedRounds.map((r: any) => r.id);

                const { error: betsError, count: bCount } = await supabaseGame
                    .from('game_bets_live')
                    .delete({ count: 'exact' })
                    .in('round_id', roundIds);

                if (betsError) throw betsError;
                arcadeBetsCount = bCount || 0;

                const { error: rError, count: rCount } = await supabaseGame
                    .from('game_rounds')
                    .delete({ count: 'exact' })
                    .in('id', roundIds);

                if (rError) throw rError;
                arcadeRoundsCount = rCount || 0;
            }

            return NextResponse.json({
                success: true,
                message: `Pruned ${gameHistCount || 0} activity logs and ${arcadeRoundsCount} arcade rounds with ${arcadeBetsCount} bets.`,
                count: (gameHistCount || 0) + arcadeRoundsCount + arcadeBetsCount
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error("Cleanup Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
