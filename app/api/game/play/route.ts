import { NextResponse } from 'next/server';
import { supabaseMain, supabaseGame } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const userId = request.headers.get('x-user-id');
        const { bet, choice } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch User Balance from Project 1
        const { data: profile, error: profileError } = await supabaseMain
            .from('profiles')
            .select('coins')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        if (profile.coins < bet) {
            return NextResponse.json({ error: 'Insufficient coins' }, { status: 400 });
        }

        // 2. Determine Result
        const winningCard = Math.random() < 0.5 ? 'A' : 'B';
        const hasWon = choice === winningCard;
        const reward = hasWon ? bet * 2 : 0;
        const netChange = hasWon ? bet : -bet;
        const newBalance = profile.coins + netChange;

        // 3. Log History in Project 2 (Game Project)
        const { error: historyError } = await supabaseGame
            .from('game_history')
            .insert([
                {
                    user_id: userId,
                    bet,
                    result: hasWon ? 'win' : 'loss',
                    choice,
                    winning_card: winningCard
                }
            ]);

        if (historyError) {
            console.error('Game History Error (Project 2):', historyError);
        }

        // 4. Update Balance and Transaction in Project 1 (Main Project)
        const { error: updateError } = await supabaseMain
            .from('profiles')
            .update({ coins: newBalance })
            .eq('id', userId);

        if (updateError) {
            throw new Error('Failed to update balance in Project 1');
        }

        await supabaseMain
            .from('transactions')
            .insert([
                {
                    user_id: userId,
                    amount: netChange,
                    type: hasWon ? 'game_win' : 'game_loss',
                    description: `Played 2-Card Game: ${choice} (${hasWon ? 'WON' : 'LOST'})`
                }
            ]);

        return NextResponse.json({
            success: true,
            hasWon,
            winningCard,
            reward,
            newBalance
        });

    } catch (error: any) {
        console.error('Game Play Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
