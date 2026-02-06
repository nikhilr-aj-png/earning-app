import { NextResponse } from 'next/server';
import { supabaseMain } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("CRITICAL: GEMINI_API_KEY IS MISSING FROM ENVIRONMENT");
            return NextResponse.json({ error: 'AI AUTH ERROR: Gemini API Key not configured on server.' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const userId = request.headers.get('x-user-id');
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabaseMain
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();

        if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const {
            count = 5,
            free_questions = 2,
            premium_questions = 4,
            free_reward = 50,
            premium_reward = 150,
            exp_h = '11',
            exp_m = '59',
            exp_p = 'PM'
        } = await request.json();

        // Calculate expires_at
        const h = parseInt(exp_h);
        const m = parseInt(exp_m);
        let hour24 = h;
        if (exp_p === 'PM' && h < 12) hour24 += 12;
        if (exp_p === 'AM' && h === 12) hour24 = 0;

        const now = new Date();
        const expDate = new Date();
        expDate.setHours(hour24, m, 0, 0);
        if (expDate <= now) {
            expDate.setDate(expDate.getDate() + 1);
        }
        const expires_at = expDate.toISOString();

        // Prompt Gemini for realistic task generation
        const prompt = `Generate ${count} professional and realistic earning tasks for a finance/earning app. 
        Each task must be a QUIZ.
        Requirements:
        1. title (Max 40 chars, e.g., "Take Financial Quiz", "Crypto Knowledge Test", "Daily Math Challenge")
        2. target_audience (One of: "free", "premium")
        3. reward (Number):
           - If target_audience is "free": Target around ${free_reward} FLOW credits.
           - If target_audience is "premium": Target around ${premium_reward} FLOW credits.
        4. type (Must be ONLY: "quiz")
        5. url (A dummy link or relevant educational link)
        6. cooldown (Number in minutes, e.g., 1440 for daily, 60 for hourly)
        7. questions (JSON Array of objects):
           - If target_audience is "free": generate exactly ${free_questions} questions.
           - If target_audience is "premium": generate exactly ${premium_questions} questions.
           - Each question object: { "question": "The text", "options": ["A", "B", "C", "D"], "answer": 0 } (answer is index of correct option).

        Return ONLY a JSON array of objects. No Markdown formatting, no extra text.`;

        // MODEL FALLBACK LOGIC
        const modelNames = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro", "gemini-flash-latest", "gemini-pro-latest"];
        let responseText = "";
        let finalModelUsed = "";
        let attemptErrors: string[] = [];

        for (const modelName of modelNames) {
            try {
                console.log(`ATTEMPTING MISSION GENERATION WITH: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                responseText = result.response.text();
                if (responseText) {
                    finalModelUsed = modelName;
                    break;
                }
            } catch (err: any) {
                const errMsg = `[${modelName}]: ${err.message}`;
                console.warn(errMsg);
                attemptErrors.push(errMsg);
                continue;
            }
        }

        if (!responseText) {
            console.error("ALL MODELS FAILED. Errors:", attemptErrors);
            throw new Error(`ALL AI MODELS FAILED TO RESPOND. \nDetails: ${attemptErrors.join(' | ')}`);
        }

        console.log(`AI MISSION DEPLOYED VIA: ${finalModelUsed}`);
        console.log("AI RAW RESPONSE:", responseText);

        // Robust JSON extraction
        let generatedTasks: any[] = [];
        try {
            // Remove markdown code blocks if present
            const cleanedText = responseText.replace(/```json|```/g, '').trim();
            generatedTasks = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error("INITIAL JSON PARSE FAILED, ATTEMPTING REGEX EXTRACTION");
            const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (jsonMatch) {
                try {
                    generatedTasks = JSON.parse(jsonMatch[0]);
                } catch (innerError) {
                    throw new Error("COULD NOT PARSE EXTRACTED JSON FROM AI RESPONSE");
                }
            } else {
                throw new Error("COULD NOT LOCATE JSON ARRAY IN AI RESPONSE");
            }
        }

        const tasksToInsert = generatedTasks.map((t: any) => ({
            expires_at,
            ...t
        }));

        const { data, error } = await supabaseMain
            .from('tasks')
            .insert(tasksToInsert)
            .select();

        if (error) {
            console.error("SUPABASE INSERT ERROR:", error);
            throw error;
        }

        const successCount = data?.length || 0;
        return NextResponse.json({ success: true, count: successCount, tasks: data || [] });
    } catch (error: any) {
        console.error("AI GENERATION ERROR:", error);
        return NextResponse.json({ error: "AI SYCHRONIZATION FAILED: " + error.message }, { status: 500 });
    }
}
