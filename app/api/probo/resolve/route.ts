import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const userId = request.headers.get('x-user-id'); // Admin check
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { eventId, result } = await request.json(); // result: 'yes' or 'no'

        // 1. Update event status
        const { error: eventError } = await supabaseMain
            .from('probo_events')
            .update({ status: 'closed', result })
            .eq('id', eventId);

        if (eventError) throw eventError;

        // 2. Find all predictions for this event
        const { data: predictions, error: predError } = await supabaseMain
            .from('probo_predictions')
            .select('*')
            .eq('event_id', eventId)
            .eq('status', 'pending');

        if (predError) throw predError;

        // 3. Process Payouts
        if (predictions && predictions.length > 0) {
            for (const pred of predictions) {
                const hasWon = pred.choice === result;
                const status = hasWon ? 'won' : 'lost';
                const payout = hasWon ? pred.amount * 2 : 0;

                // Update prediction status
                await supabaseMain
                    .from('probo_predictions')
                    .update({ status })
                    .eq('id', pred.id);

                if (hasWon) {
                    // Credit user coins
                    await supabaseMain.rpc('increment_user_coins', {
                        u_id: pred.user_id,
                        amount: payout
                    });

                    // Log transaction
                    await supabaseMain
                        .from('transactions')
                        .insert([{
                            user_id: pred.user_id,
                            amount: payout,
                            type: 'probo_payout',
                            description: `Probo Win: Event Result ${result.toUpperCase()}`
                        }]);
                }
            }
        }

        return NextResponse.json({ success: true, processed: predictions?.length || 0 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
