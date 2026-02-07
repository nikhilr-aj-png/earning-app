import { NextResponse } from 'next/server';
import { supabaseMain, supabaseAdmin } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const isManual = body.isManual === true;

        const userId = request.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 1. Verify Admin
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();

        if (!profile?.is_admin) return NextResponse.json({ error: 'Limited Access: Admin Only' }, { status: 403 });

        // 2. Fetch Automation Settings (Self-Healing)
        let { data: settings, error: settingsError } = await supabaseAdmin
            .from('automation_settings')
            .select('*')
            .maybeSingle();

        if (settingsError) throw settingsError;

        if (!settings) {
            console.log("Automation settings missing. Initializing defaults...");
            const { data: newSettings, error: createError } = await supabaseAdmin
                .from('automation_settings')
                .insert([{
                    is_enabled: false,
                    free_task_count: 5,
                    premium_task_count: 5,
                    free_reward: 50,
                    premium_reward: 150,
                    exp_h: '11',
                    exp_m: '59',
                    exp_p: 'PM'
                }])
                .select()
                .single();

            if (createError) throw new Error("Failed to auto-initialize settings: " + createError.message);
            settings = newSettings;
        }
        if (!settings.is_enabled) return NextResponse.json({ success: false, message: "Automation is disabled. Please activate it first." });

        // 3. PURGE EXPIRED MISSIONS (Always run first)
        const now = new Date().toISOString();
        const { error: purgeError } = await supabaseAdmin
            .from('tasks')
            .delete()
            .lt('expires_at', now)
            .eq('type', 'quiz');

        if (purgeError) console.error("Purge Error:", purgeError);


        // 4. DENSITY & WINDOW CHECK
        const { data: currentTasks, error: countError } = await supabaseAdmin
            .from('tasks')
            .select('id, target_audience')
            .eq('type', 'quiz'); // CRITICAL: Only count quizzes for replenishment

        if (countError) throw countError;

        // The user wants replenishment to strictly match what was lost or what's needed to hit the target
        const freeCount = currentTasks.filter((t: any) => t.target_audience === 'free').length;
        const premiumCount = currentTasks.filter((t: any) => t.target_audience === 'premium').length;

        const freeDelta = Math.max(0, settings.free_task_count - freeCount);
        const premiumDelta = Math.max(0, settings.premium_task_count - premiumCount);

        console.log(`Sync Stats - Free: ${freeCount}/${settings.free_task_count} (Delta: ${freeDelta}), Premium: ${premiumCount}/${settings.premium_task_count} (Delta: ${premiumDelta})`);

        // Calculate current scheduled sync time
        const h = parseInt(settings.exp_h);
        const m = parseInt(settings.exp_m);
        let hour24 = h;
        if (settings.exp_p === 'PM' && h < 12) hour24 += 12;
        if (settings.exp_p === 'AM' && h === 12) hour24 = 0;

        const targetTime = new Date();
        targetTime.setHours(hour24, m, 0, 0);

        // If targetTime has passed (e.g. it's 12:05 AM and target was 12:00 AM), we are in window
        const nowTime = new Date();
        const diffMs = nowTime.getTime() - targetTime.getTime();
        const isInWindow = diffMs >= 0 && diffMs < 10 * 60 * 1000; // 10 minute window

        // Determine if we should skip generation
        let shouldGenerate = isManual;
        if (!isManual && (freeDelta > 0 || premiumDelta > 0)) {
            // Background generation ONLY if in window and haven't synced recently
            const lastSyncTime = settings.last_sync ? new Date(settings.last_sync).getTime() : 0;
            const targetTimeMs = targetTime.getTime();

            if (isInWindow && lastSyncTime < targetTimeMs) {
                console.log("Scheduled Sync Window Active: Triggering Generation...");
                shouldGenerate = true;
            } else {
                console.log("Background Pulse: Outside sync window or already synced today. Skipping generation.");
            }
        }

        if (!shouldGenerate) {
            await supabaseAdmin.from('automation_settings').update({ last_sync: now }).eq('id', settings.id);
            return NextResponse.json({
                success: true,
                message: isManual ? "Optimal density achieved." : "Background pulse complete (Purge only).",
                free: freeCount,
                premium: premiumCount
            });
        }

        // 5. AI GENERATION (IF NEEDED)
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY missing");

        const genAI = new GoogleGenerativeAI(apiKey);

        // Re-calculate next expires_at using existing h, m, hour24
        const expDate = new Date();
        expDate.setHours(hour24, m, 0, 0);
        if (expDate <= new Date()) {
            expDate.setDate(expDate.getDate() + 1);
        }
        const expires_at = expDate.toISOString();

        const prompts = [];
        if (freeDelta > 0) {
            prompts.push(`Generate ${freeDelta} quiz tasks for FREE users. Title max 40 chars. Reward around ${settings.free_reward} FLOW. Require 2 questions each.`);
        }
        if (premiumDelta > 0) {
            prompts.push(`Generate ${premiumDelta} quiz tasks for PREMIUM users. Title max 40 chars. Reward around ${settings.premium_reward} FLOW. Require 4 questions each.`);
        }

        const compositePrompt = `Task: Generate educational/finance quizzes.
        Constraints:
        - Return ONLY a JSON array with EXACTLY ${freeDelta + premiumDelta} items.
        - The array MUST contain ${freeDelta} free tasks and ${premiumDelta} premium tasks.
        - Fields: title, reward, type="quiz", target_audience("free" or "premium"), questions(Array).
        - Question format: {question, options, answer(index)}.
        - Do not include any text outside the JSON array.
        
        Requirements:
        ${prompts.join('\n')}
        `;

        const modelNames = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];
        let responseText = "";
        let lastError = "";
        let isRateLimited = false;

        for (const modelName of modelNames) {
            try {
                // If the previous model hit a 429, wait 5 seconds before trying the next one
                if (isRateLimited) {
                    console.log("Rate limit detected. Sleeping 5s before fallback...");
                    await new Promise(r => setTimeout(r, 5000));
                }

                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(compositePrompt);
                responseText = result.response.text();
                if (responseText) break;
            } catch (err: any) {
                lastError = err.message || "Unknown Gemini Error";
                console.warn(`Model ${modelName} failed: ${lastError}`);

                if (lastError.includes("429") || lastError.toLowerCase().includes("quota") || lastError.toLowerCase().includes("busy")) {
                    isRateLimited = true;
                } else {
                    // If it's not a rate limit, don't wait as long for fallback
                    isRateLimited = false;
                }
                continue;
            }
        }

        if (!responseText) throw new Error(`API LIMIT REACHED: Gemini core is currently busy (Error 429). Please wait 60 seconds and try again.`);

        // Robust JSON Extraction
        // Sometimes AI returns markdown like ```json ... ```
        const jsonMatch = responseText.replace(/```json/g, '').replace(/```/g, '').match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("AI responded but format was invalid. Response: " + responseText.substring(0, 100));

        const generated = JSON.parse(jsonMatch[0]);
        if (!Array.isArray(generated) || generated.length === 0) {
            throw new Error("AI generated an empty task list.");
        }

        const tasksToInsert = generated.map((t: any) => ({
            title: t.title?.substring(0, 40) || "Untitled Mission",
            reward: parseInt(t.reward) || 50,
            type: "quiz",
            target_audience: t.target_audience === 'premium' ? 'premium' : 'free',
            questions: t.questions || [],
            expires_at: expires_at,
            cooldown: 1440 // Default 24h
        }));

        console.log(`Inserting ${tasksToInsert.length} tasks...`);
        const { data: inserted, error: insertError } = await supabaseAdmin
            .from('tasks')
            .insert(tasksToInsert)
            .select();

        if (insertError) throw new Error("Database Insertion Failed: " + JSON.stringify(insertError));

        // 6. Manual Cleanup (Atomic)
        if (isManual) {
            console.log("Atomic Sync: AI Success. Purging old quizzes to replace with new batch...");
            // Delete all OLD quizzes that are NOT the ones we just inserted
            const insertedIds = inserted?.map((t: any) => t.id) || [];
            await supabaseAdmin
                .from('tasks')
                .delete()
                .eq('type', 'quiz')
                .not('id', 'in', `(${insertedIds.join(',')})`);
        }

        // 6. Finalize Sync
        await supabaseAdmin.from('automation_settings').update({ last_sync: now }).eq('id', settings.id);

        return NextResponse.json({
            success: true,
            purged: true,
            generated: inserted?.length || 0,
            free_now: freeCount + (inserted?.filter((t: any) => t.target_audience === 'free').length || 0),
            premium_now: premiumCount + (inserted?.filter((t: any) => t.target_audience === 'premium').length || 0)
        });

    } catch (error: any) {
        console.error("Sync Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
