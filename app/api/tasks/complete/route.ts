import { NextResponse } from 'next/server';
import { supabaseMain, supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const userId = request.headers.get('x-user-id');
        const { taskId, correctCount, totalCount } = await request.json();

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

        // 1.5 Security: Check if task is expired
        if (task.expires_at && new Date(task.expires_at).getTime() < Date.now()) {
            return NextResponse.json({ error: 'MISSION EXPIRED: Rewards no longer available.' }, { status: 410 });
        }

        // 2. Fetch User Profile
        const { data: profile, error: profileError } = await supabaseMain
            .from('profiles')
            .select('coins, is_premium, is_admin')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // 2.5 Security: Check if Free user is trying to claim Premium task
        if (task.target_audience === 'premium' && !profile.is_premium && !profile.is_admin) {
            return NextResponse.json({ error: 'PREMIUM STATUS REQUIRED FOR THIS MISSION' }, { status: 403 });
        }

        const isPremium = profile.is_premium === true;

        // 2.6 CHECK FOR PRIOR ATTEMPTS (Strict Single Attempt)
        const { data: existingTx } = await supabaseMain
            .from('transactions')
            .select('id')
            .eq('user_id', userId)
            .ilike('description', `%[CLAIMED:${taskId}]%`)
            .limit(1);

        if (existingTx && existingTx.length > 0) {
            return NextResponse.json({ error: 'MISSION ALREADY ATTEMPTED (LOCK ACTIVE)' }, { status: 400 });
        }

        // Calculate Reward Proportional to Accuracy (Premium Booster Removed)
        const accuracy = totalCount > 0 ? Math.min(1, correctCount / totalCount) : 1;
        const totalReward = Math.ceil(task.reward * accuracy);

        const newBalance = (profile.coins || 0) + totalReward;

        // 3. Record Transaction (Use supabaseAdmin to bypass RLS for rewards)
        const { error: txError } = await supabaseAdmin
            .from('transactions')
            .insert([
                {
                    user_id: userId,
                    amount: totalReward,
                    type: 'earn',
                    description: totalCount !== undefined
                        ? `[CLAIMED:${taskId}] Result: ${correctCount}/${totalCount} | ${task.title}`
                        : `[CLAIMED:${taskId}] | ${task.title}`
                }
            ]);

        if (txError) {
            console.error('Transaction Error:', txError);
            throw new Error(`Failed to record transaction: ${txError.message}`);
        }

        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ coins: newBalance })
            .eq('id', userId);

        if (updateError) {
            console.error('Balance Update Error:', updateError);
            throw new Error(`Failed to update balance: ${updateError.message}`);
        }

        return NextResponse.json({
            success: true,
            reward: totalReward,
            newBalance
        });
    } catch (error: any) {
        console.error('Task Completion Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
