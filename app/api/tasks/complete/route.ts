import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const userId = request.headers.get('x-user-id');
        const { taskId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch Task
        const { data: task, error: taskError } = await supabaseMain
            .from('tasks')
            .select('*')
            .eq('id', taskId)
            .single();

        if (taskError || !task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // 2. Fetch User Profile
        const { data: profile, error: profileError } = await supabaseMain
            .from('profiles')
            .select('coins, is_premium')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const isPremium = profile.is_premium === true;
        const baseReward = task.reward;
        const booster = isPremium ? Math.floor(baseReward * 0.2) : 0;
        const totalReward = baseReward + booster;
        const newBalance = (profile.coins || 0) + totalReward;

        // 3. Record Transaction
        const { error: txError } = await supabaseMain
            .from('transactions')
            .insert([
                {
                    user_id: userId,
                    amount: totalReward,
                    type: 'earn',
                    description: `Completed task: ${task.title} ${isPremium ? '(+20% PREMIUM BOOST)' : ''}`
                }
            ]);

        if (txError) {
            throw new Error('Failed to record transaction');
        }

        const { error: updateError } = await supabaseMain
            .from('profiles')
            .update({ coins: newBalance })
            .eq('id', userId);

        if (updateError) {
            throw new Error('Failed to update balance');
        }

        return NextResponse.json({
            success: true,
            reward: totalReward,
            base: baseReward,
            bonus: booster,
            newBalance
        });
    } catch (error: any) {
        console.error('Task Completion Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
