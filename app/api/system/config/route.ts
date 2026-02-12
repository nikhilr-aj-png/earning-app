import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data, error } = await supabaseMain
            .from('system_settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) {
            // If table doesn't exist yet, return safe defaults
            console.warn("System settings table missing or error", error.message);
            return NextResponse.json({
                buy_flow_enabled: true,
                game_section_enabled: true,
                maintenance_mode: false
            });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({
            buy_flow_enabled: true,
            game_section_enabled: true,
            maintenance_mode: false
        });
    }
}
