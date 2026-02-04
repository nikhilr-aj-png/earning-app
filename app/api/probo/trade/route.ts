import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const userId = request.headers.get('x-user-id');
        const { eventId, choice, amount } = await request.json();

        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

        // 1. Transactional check and deduct balance
        // Note: For high concurrency, use a Supabase RPC/Function. 
        // Here we do sequential for simplicity.
        const { data: profile, error: profileError } = await supabaseMain
            .from('profiles')
            .select('coins')
            .eq('id', userId)
            .single();

        if (profileError || !profile) throw new Error('Profile not found');
        if (profile.coins < amount) return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });

        // 2. Insert prediction
        const { data: prediction, error: predError } = await supabaseMain
            .from('probo_predictions')
            .insert([{ user_id: userId, event_id: eventId, choice, amount }])
            .select()
            .single();

        if (predError) throw predError;

        // 3. Update coins
        const { error: updateError } = await supabaseMain
            .from('profiles')
            .update({ coins: profile.coins - amount })
            .eq('id', userId);

        if (updateError) throw updateError;

        // 4. Log transaction
        await supabaseMain
            .from('transactions')
            .insert([{
                user_id: userId,
                amount: -amount,
                type: 'probo_trade',
                description: `Opinion Trade: ${choice.toUpperCase()} on Event #${eventId.substring(0, 5)}`
            }]);

        return NextResponse.json(prediction);

    } catch (error: any) {
        console.error('Probo Trade Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
