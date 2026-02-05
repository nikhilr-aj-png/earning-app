import { createClient } from '@supabase/supabase-js';

const mainUrl = process.env.NEXT_PUBLIC_SUPABASE_MAIN_URL || '';
const mainAnonKey = process.env.NEXT_PUBLIC_SUPABASE_MAIN_ANON_KEY || '';

const gameUrl = process.env.NEXT_PUBLIC_SUPABASE_GAME_URL || '';
const gameAnonKey = process.env.NEXT_PUBLIC_SUPABASE_GAME_ANON_KEY || '';

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Defensive Client Initialization
// This prevents the build from crashing if env vars are missing from the CI environment
const createSafeClient = (url: string, key: string, options?: any) => {
    if (!url || !key) {
        // Return a proxy or a dummy client to avoid null pointer errors during pre-rendering
        // Real errors will be thrown during runtime when a request is actually made
        console.warn(`[Supabase] Missing configuration for URL: ${url || 'UNDEFINED'}`);
        return {
            from: () => ({
                select: () => ({ order: () => ({ data: [], error: { message: 'Supabase URL or Key is missing' } }) }),
                insert: () => ({ error: { message: 'Supabase URL or Key is missing' } }),
                update: () => ({ error: { message: 'Supabase URL or Key is missing' } }),
                delete: () => ({ error: { message: 'Supabase URL or Key is missing' } }),
            }),
            auth: {
                admin: {
                    deleteUser: async () => ({ error: { message: 'Supabase Admin Key is missing' } })
                }
            }
        } as any;
    }
    return createClient(url, key, options);
};

export const supabaseMain = createSafeClient(mainUrl, mainAnonKey);

export const supabaseAdmin = createSafeClient(mainUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

export const supabaseGame = createSafeClient(gameUrl, gameAnonKey);
