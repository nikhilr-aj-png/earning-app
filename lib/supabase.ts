import { createClient } from '@supabase/supabase-js';

const mainUrl = process.env.NEXT_PUBLIC_SUPABASE_MAIN_URL || '';
const mainAnonKey = process.env.NEXT_PUBLIC_SUPABASE_MAIN_ANON_KEY || '';

const gameUrl = process.env.NEXT_PUBLIC_SUPABASE_GAME_URL || '';
const gameAnonKey = process.env.NEXT_PUBLIC_SUPABASE_GAME_ANON_KEY || '';

// Client 1: Main (Auth, Profiles, Tasks, Wallet)
export const supabaseMain = createClient(mainUrl, mainAnonKey);

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const supabaseAdmin = createClient(mainUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Client 2: Game (Card Game Records)
export const supabaseGame = createClient(gameUrl, gameAnonKey);
