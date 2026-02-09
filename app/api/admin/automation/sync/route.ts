import { NextResponse } from 'next/server';
import { supabaseMain, supabaseAdmin } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
    const trace: string[] = [];
    try {
        const entryNow = new Date().toISOString();
        trace.push(`ENTRY: Sync API triggered at ${entryNow}`);
        const body = await request.json().catch(() => ({}));
        const isManual = body.isManual === true;
        trace.push(`PARAMS: isManual=${isManual}`);

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
            .order('created_at', { ascending: false })
            .limit(1)
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
            trace.push("SETTINGS: Initialized defaults (Self-Healing passed)");
            settings = newSettings;
        } else {
            trace.push("SETTINGS: Found existing configuration");
        }

        // GUARD: Overlap Protection (Atomic Mutex)
        // We pulse every 60s. The lock should clear after 25s.
        const lockThreshold = new Date(Date.now() - 25000).toISOString();
        const { data: lockAcquisition, error: lockError } = await supabaseAdmin
            .from('automation_settings')
            .update({ last_sync: new Date().toISOString() })
            .match({ id: settings.id })
            // Only proceed if last_sync is old (25s) OR last_sync is null (first run)
            .or(`last_sync.lt.${lockThreshold},last_sync.is.null`)
            .select();

        if (lockError) throw lockError;

        if ((!lockAcquisition || lockAcquisition.length === 0) && !isManual) {
            const timeSince = settings.last_sync ? Math.round((Date.now() - new Date(settings.last_sync).getTime()) / 1000) : 'N/A';
            trace.push(`GUARD: Pulse blocked (Lock held by another pulse. Last sync: ${timeSince}s ago)`);
            return NextResponse.json({ success: false, message: "Sync pulse skipped: Pulse already in progress." });
        }

        trace.push("LOCK: Atomic mutex acquired.");

        if (!isManual) {
            trace.push("SYNC_MONITOR: Background pulse restricted to READ-ONLY mode.");
            await supabaseAdmin.from('automation_settings').update({
                last_sync: new Date().toISOString()
            }).eq('id', settings.id);

            return NextResponse.json({
                success: true,
                message: "Sync Monitor Active (Read-Only)",
                trace
            });
        }


        // 3. PURGE EXPIRED & MISMATCHED MISSIONS
        const nowUtc = new Date();
        const now = nowUtc.toISOString();
        // HEARTBEAT ALIGNMENT: 
        // We pulse every 60s. Purge anything expiring in the next 75s.
        const purgeThreshold = new Date(nowUtc.getTime() + 75000).toISOString();

        // Fetch all current tasks to check rewards
        const { data: allTasks } = await supabaseAdmin.from('tasks').select('id, title, reward, target_audience, expires_at, type');

        const idsToPurge: string[] = [];
        allTasks?.forEach((t: any) => {
            const isDefunct = t.expires_at < now;
            const targetReward = t.target_audience === 'premium' ? settings.premium_reward : settings.free_reward;
            const isRewardMismatch = t.reward !== targetReward;
            const isNearExpiry = t.expires_at < purgeThreshold;

            trace.push(`CHECK: ${t.title.slice(0, 10)}.. | Exp: ${t.expires_at} | Defunct: ${isDefunct} | NearExp: ${isNearExpiry}`);

            // Purge if: Manual Reset OR Expired OR Reward Mismatch OR Near Expiry (within 75s)
            if (isManual || isDefunct || isRewardMismatch || isNearExpiry) {
                idsToPurge.push(t.id);
                trace.push(`PURGE_QUEUE: ${t.title} | Reason: ${isManual ? 'MANUAL_RESET' : isDefunct ? 'EXPIRED' : isRewardMismatch ? 'REWARD_MISMATCH' : 'NEAR_EXPIRY'}`);
            }
        });

        if (idsToPurge.length > 0) {
            const { error: purgeError } = await supabaseAdmin
                .from('tasks')
                .delete()
                .in('id', idsToPurge);

            if (purgeError) trace.push(`PURGE_ERROR: ${purgeError.message}`);
            else trace.push(`PURGE: Removed ${idsToPurge.length} missions.`);
        }


        // 4. DENSITY & WINDOW CHECK (Count ONLY active missions)
        const { data: currentTasks, error: countError } = await supabaseAdmin
            .from('tasks')
            .select('id, target_audience')
            .eq('type', 'quiz')
            .gt('expires_at', purgeThreshold); // ALIGNMENT: Count missions that survive the NEXT pulse

        if (countError) throw countError;

        // The user wants replenishment to strictly match what was lost or what's needed to hit the target
        const freeCount = currentTasks.filter((t: any) => t.target_audience === 'free').length;
        const premiumCount = currentTasks.filter((t: any) => t.target_audience === 'premium').length;

        let freeDelta = Math.max(0, settings.free_task_count - freeCount);
        let premiumDelta = Math.max(0, settings.premium_task_count - premiumCount);

        // 1-TO-1 PARITY AUDIT
        trace.push(`PARITY_CHECK: [FREE: Missing=${freeDelta}] [PREMIUM: Missing=${premiumDelta}]`);
        trace.push(`STRATEGY: Replenishing exactly ${freeDelta + premiumDelta} missions to maintain targets.`);

        // DURATION-BASED EXPIRY SYSTEM
        // We now treat exp_h as "Life Duration in Minutes"
        const durationMins = parseInt(settings.exp_h) || 1440; // Default 24h
        const targetDate = new Date(nowUtc.getTime() + durationMins * 60 * 1000);

        const expires_at = targetDate.toISOString();
        const minsRemaining = Math.round((targetDate.getTime() - nowUtc.getTime()) / 60000);

        trace.push(`DURATION_SYNC: Missions set to expire in ${durationMins} minutes.`);
        trace.push(`EXPIRY_SET: ${expires_at} (${minsRemaining}m life)`);

        if (!isManual) {
            trace.push("SKIP: Background pulses are now READ-ONLY. Replenishment requires Manual Trigger.");
            await supabaseAdmin.from('automation_settings').update({ last_sync: nowUtc.toISOString() }).eq('id', settings.id);
            return NextResponse.json({
                success: true,
                message: "Sync Monitor Active (Manual Mode)",
                trace
            });
        }

        // GUARD: Only generate if counts are low or manual reset
        let shouldGenerate = isManual;

        // 5. AI GENERATION (IF NEEDED)
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY missing");
        const genAI = new GoogleGenerativeAI(apiKey);

        const prompts = [];
        if (freeDelta > 0) {
            prompts.push(`Generate ${freeDelta} PROFESSIONAL FINANCE quizzes for ambitious users. Topics: Advanced market psychology, portfolio rebalancing, or fiscal policy. Title max 40 chars. Reward MUST BE EXACTLY ${settings.free_reward} FLOW. Require 2 questions each.`);
        }
        if (premiumDelta > 0) {
            prompts.push(`Generate ${premiumDelta} EXPERT-LEVEL CRYPTO/INVESTMENT missions. Topics: DeFi liquidation risks, yield farming strategies, or institutional trading patterns. Title max 40 chars. Reward MUST BE EXACTLY ${settings.premium_reward} FLOW. Require 4 questions each.`);
        }

        const compositePrompt = `Task: Generate high-stakes financial and technical quizzes for a professional operational hub.
        Constraints:
        - Return ONLY a JSON array with EXACTLY ${freeDelta + premiumDelta} items.
        - The array MUST contain ${freeDelta} professional tasks and ${premiumDelta} expert tasks.
        - Fields: title, reward, type="quiz", target_audience("free" or "premium"), questions(Array).
        - Question format: {question, options(4 strings), answer(index)}.
        - Tone: Tactical, professional, non-promotional.
        - Topics must be sophisticated (e.g., "Quantitative Easing Effects" instead of "What is Money").
        - No markdown formatting. No text outside JSON.
        
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
                    console.log("Rate limit detected. Sleeping 10s before fallback...");
                    await new Promise(r => setTimeout(r, 10000));
                }

                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(compositePrompt);
                responseText = result.response.text();
                trace.push(`AI_SUCCESS: Model ${modelName} responded`);
                break;
            } catch (err: any) {
                lastError = err.message || "Unknown Gemini Error";
                trace.push(`AI_RETRY: Model ${modelName} failed (${lastError.substring(0, 30)}...)`);
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

        let generated = [];
        let isMockUsed = false;

        if (!responseText) {
            trace.push("FALLBACK: AI Limit reached. Using pre-defined high-quality missions.");
            isMockUsed = true;

            const mockFree = [
                { title: "Market Mastery: Bull vs Bear", reward: settings.free_reward, target_audience: 'free', questions: [{ question: "What is a 'Bull Market'?", options: ["Rising Prices", "Falling Prices", "Sideways", "Closed"], answer: 0 }, { question: "What does 'ROI' stand for?", options: ["Risk on Investment", "Return on Interest", "Return on Investment", "Redistribution"], answer: 2 }] },
                { title: "Crypto Security 101", reward: settings.free_reward, target_audience: 'free', questions: [{ question: "Where should you keep seed phrases?", options: ["On your phone", "In a physical safe", "Email", "Public cloud"], answer: 1 }, { question: "What is 2FA?", options: ["Two Factor Authentication", "Fast Access", "Fixed Amount", "Folder Access"], answer: 0 }] },
                { title: "Savings Hack: The 50/30/20 Rule", reward: settings.free_reward, target_audience: 'free', questions: [{ question: "What does the '50' represent?", options: ["Wants", "Needs", "Savings", "Debt"], answer: 1 }, { question: "Which is a 'Need'?", options: ["Netflix", "Rent", "Dining Out", "New Shoes"], answer: 1 }] },
                { title: "Inflation Basics", reward: settings.free_reward, target_audience: 'free', questions: [{ question: "What is inflation?", options: ["Prices falling", "Prices rising", "Stock market crash", "Bank holiday"], answer: 1 }, { question: "Which usually rises with inflation?", options: ["Cash value", "Cost of living", "Fixed pension", "Savings rate"], answer: 1 }] },
                { title: "Credit Score Fundamentals", reward: settings.free_reward, target_audience: 'free', questions: [{ question: "What impacts your score most?", options: ["Income", "Payment history", "Age", "Job title"], answer: 1 }, { question: "Is a higher score better?", options: ["Yes", "No", "Only for banks", "Doesnt matter"], answer: 0 }] }
            ];

            const mockPremium = [
                { title: "Premium Strategy: Diversification", reward: settings.premium_reward, target_audience: 'premium', questions: [{ question: "Which asset is usually considered a 'safe haven'?", options: ["Bitcoin", "Gold", "Options", "Startups"], answer: 1 }, { question: "What is 'Dollar Cost Averaging'?", options: ["Buying all at once", "Buying at intervals", "Saving in cash", "Shorting stocks"], answer: 1 }, { question: "What is a 'Dividend'?", options: ["A fee paid", "Profit shared by company", "Stock price", "Tax"], answer: 1 }, { question: "Which is more liquid?", options: ["Real Estate", "Cash", "Private Equity", "Art"], answer: 1 }] },
                { title: "Advanced Technical Analysis", reward: settings.premium_reward, target_audience: 'premium', questions: [{ question: "What does an RSI of 70+ usually indicate?", options: ["Oversold", "Overbought", "Neutral", "Trend reversal"], answer: 1 }, { question: "What is a 'Candlestick' chart?", options: ["Bar chart", "Price display", "Volume tool", "Indicator"], answer: 1 }, { question: "What is support?", options: ["Price ceiling", "Price floor", "Wall Street tech", "Customer service"], answer: 1 }, { question: "What is a 'Short Squeeze'?", options: ["Price drop", "Rapid price rise", "Delisting", "Audit"], answer: 1 }] },
                { title: "Global Macro Trends", reward: settings.premium_reward, target_audience: 'premium', questions: [{ question: "What is GDP?", options: ["Gross Debt", "Gross Domestic Product", "General Data", "Gold Price"], answer: 1 }, { question: "What is a 'Bear Market'?", options: ["20% drop", "10% rise", "Stable", "New high"], answer: 0 }, { question: "What is Decentralized Finance?", options: ["Bank app", "DeFi", "Central bank", "Cash system"], answer: 1 }, { question: "What is Volatility?", options: ["Safety", "Price fluctuations", "Profit", "Loss"], answer: 1 }] }
            ];

            generated = [
                ...mockFree.slice(0, freeDelta),
                ...mockPremium.slice(0, premiumDelta)
            ].slice(0, freeDelta + premiumDelta);

            // If deltas are still larger than our pool, repeat the pool
            while (generated.length < freeDelta + premiumDelta) {
                if (generated.filter(g => g.target_audience === 'free').length < freeDelta) {
                    generated.push({ ...mockFree[Math.floor(Math.random() * mockFree.length)], title: `Copy: ${mockFree[0].title} ${Math.random().toString(36).substring(7)}` });
                } else {
                    generated.push({ ...mockPremium[Math.floor(Math.random() * mockPremium.length)], title: `Copy: ${mockPremium[0].title} ${Math.random().toString(36).substring(7)}` });
                }
            }
        } else {
            // Robust JSON Extraction
            const jsonMatch = responseText.replace(/```json/g, '').replace(/```/g, '').match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error("AI responded but format was invalid.");
            generated = JSON.parse(jsonMatch[0]).slice(0, freeDelta + premiumDelta);
        }

        if (!Array.isArray(generated) || generated.length === 0) throw new Error("Generation resulted in empty list.");

        const tasksToInsert = [];

        // Distribute items into insertion queue strictly based on deltas
        const availableFree = generated.filter((t: any) => t.target_audience === 'free');
        const availablePremium = generated.filter((t: any) => t.target_audience === 'premium' || t.target_audience === 'pref');

        trace.push(`DISTRIBUTION: AI returned ${availableFree.length} Free / ${availablePremium.length} Premium.`);

        // 1. Replenish FREE
        for (let i = 0; i < freeDelta; i++) {
            const template = availableFree[i] || (responseText === "" ? generated[i % generated.length] : availableFree[0]);
            tasksToInsert.push({
                title: (i > availableFree.length - 1 ? `PRO: ${template.title}` : template.title).substring(0, 40),
                reward: settings.free_reward || 50,
                type: "quiz",
                target_audience: 'free',
                questions: template.questions || [],
                expires_at: expires_at,
                cooldown: 1440
            });
        }

        // 2. Replenish PREMIUM
        for (let i = 0; i < premiumDelta; i++) {
            const template = availablePremium[i] || (responseText === "" ? generated[availableFree.length + (i % (generated.length - availableFree.length))] : availablePremium[0]);
            tasksToInsert.push({
                title: (i > availablePremium.length - 1 ? `EXPERT: ${template.title}` : template.title).substring(0, 40),
                reward: settings.premium_reward || 150,
                type: "quiz",
                target_audience: 'premium',
                questions: template.questions || [],
                expires_at: expires_at,
                cooldown: 1440
            });
        }

        trace.push(`FINAL_INSERT_READY: Prepared exactly ${tasksToInsert.length} tasks (${freeDelta} Free, ${premiumDelta} Premium)`);

        console.log(`Inserting ${tasksToInsert.length} tasks...`);
        const { data: inserted, error: insertError } = await supabaseAdmin
            .from('tasks')
            .insert(tasksToInsert)
            .select();

        if (insertError) throw new Error("Database Insertion Failed: " + JSON.stringify(insertError));

        // 6. Manual Cleanup (Atomic)
        if (isManual) {
            trace.push("ATOMIC_SYNC: AI Result received. Purging old quizzes to allow fresh intake.");
            // Purge ALL quizzes that were NOT just inserted
            const insertedIds = inserted?.map((t: any) => t.id) || [];
            if (insertedIds.length > 0) {
                await supabaseAdmin
                    .from('tasks')
                    .delete()
                    .eq('type', 'quiz')
                    .not('id', 'in', insertedIds);
            }
        }

        // 6. Finalize Sync
        await supabaseAdmin.from('automation_settings').update({
            last_sync: nowUtc.toISOString()
        }).eq('id', settings.id);

        return NextResponse.json({
            success: true,
            purged: idsToPurge.length > 0,
            generated: inserted?.length || 0,
            is_mock: isMockUsed,
            free_now: (inserted?.filter((t: any) => t.target_audience === 'free').length || 0),
            premium_now: (inserted?.filter((t: any) => t.target_audience === 'premium').length || 0),
            trace
        });

    } catch (error: any) {
        console.error("Sync Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
