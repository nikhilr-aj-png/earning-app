import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // For testing/simulation: Allow upgrade if user has 999 coins or just simulate it
        // In a real app, verify payment first.

        const { error } = await supabaseMain
            .from('profiles')
            .update({
                is_premium: true,
                premium_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            })
            .eq('id', userId);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'ACCOUNT UPGRADED TO PREMIUM ELITE' });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Upgrade failed' }, { status: 500 });
    }
}
