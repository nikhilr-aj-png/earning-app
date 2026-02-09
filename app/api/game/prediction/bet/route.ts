export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseGame } from '@/lib/supabase';
import { supabaseMain as supabase } from '@/lib/supabase'; // Main project for user balance

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { event_id, amount, choice, user_id } = body;

        if (!event_id || !amount || !choice || !user_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

        // 1. Check Event Status & Expiry
        const { data: event, error: eventError } = await supabaseGame
            .from('prediction_events')
            .select('*')
            .eq('id', event_id)
            .single();

        if (eventError || !event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        if (event.status !== 'active') return NextResponse.json({ error: 'Event is closed' }, { status: 400 });
        if (new Date(event.expires_at) < new Date()) return NextResponse.json({ error: 'Event has expired' }, { status: 400 });

        // 1b. Check Bet Mode & Min Bet
        const minBet = event.min_bet || 10;
        const betMode = event.bet_mode || 'flexible';

        if (betMode === 'fixed') {
            if (amount !== minBet) {
                return NextResponse.json({ error: `Fixed Bet Mode: You must bet exactly ${minBet} coins.` }, { status: 400 });
            }
        } else {
            if (amount < minBet) {
                return NextResponse.json({ error: `Minimum bet amount is ${minBet} coins.` }, { status: 400 });
            }
        }

        // 2. Check User Balance (Main Project)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('coins, is_premium')
            .eq('id', user_id)
            .single();

        if (profileError || !profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // 1c. Check Target Audience
        if (event.target_audience === 'premium' && !profile.is_premium) {
            return NextResponse.json({ error: 'This event is restricted to Premium users.' }, { status: 403 });
        }

        if (profile.coins < amount) return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });

        // 3. Deduct Balance (Main Project)
        const { error: deductError } = await supabase
            .from('profiles')
            .update({ coins: profile.coins - amount })
            .eq('id', user_id);

        if (deductError) throw deductError;

        // 4. Record Bet (Game Project)
        const { error: betError } = await supabaseGame
            .from('prediction_bets')
            .insert([{
                event_id,
                user_id,
                amount,
                choice,
                status: 'pending'
            }]);

        if (betError) {
            // Rollback coins (Critical)
            await supabase.from('profiles').update({ coins: profile.coins }).eq('id', user_id);
            throw betError;
        }

        // 5. Update Event Pool (Game Project)
        const poolField = choice === 'option_1' ? 'pool_1' : 'pool_2';
        const currentPool = event[poolField] || 0;

        await supabaseGame
            .from('prediction_events')
            .update({ [poolField]: currentPool + amount })
            .eq('id', event_id);

        return NextResponse.json({ success: true, newBalance: profile.coins - amount });

    } catch (error: any) {
        console.error("Betting Error:", error);
        return NextResponse.json({ error: error.message || 'Bet processing failed' }, { status: 500 });
    }
}
