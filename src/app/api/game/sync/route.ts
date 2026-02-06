import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => null);
        if (!body) {
            return Response.json({ ok: false, message: "Missing request body" }, { status: 400 });
        }

        // 1. Service Role Key Check
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!serviceRoleKey) {
            console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
            return Response.json(
                { ok: false, message: 'Server configuration error: Missing Service Role Key.' },
                { status: 500 }
            );
        }

        // 2. Init Admin Client
        const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 3. Parse & Map Data
        const { id: gameCode, category, type, content, timer, options } = body;

        let dbType = type;
        if (type === 'C') dbType = 'balance_light';
        else if (type === 'Q') dbType = 'talk_tmi';
        else if (type === 'balance_light' || type === 'talk_tmi') dbType = type;

        const dbPayload = {
            code: gameCode,
            category: category === '아이스브레이킹' ? 'icebreaking' :
                category === '소개팅·미팅' ? 'dating' :
                    category === '회식·술자리' ? 'drinking' :
                        category === '크루모드' ? 'crewmode' : category,
            content,
            type: dbType,
            timer,
            options: typeof options === 'string' ? JSON.parse(options) : options
        };

        // 4. Upsert
        const { data, error } = await supabaseAdmin
            .from('questions')
            .upsert(dbPayload, { onConflict: 'code' })
            .select('id')
            .single();

        if (error) {
            console.error('Supabase Upsert Error:', error);
            return Response.json({ ok: false, message: error.message, code: error.code }, { status: 400 });
        }

        return Response.json({ ok: true, id: data.id });

    } catch (e: any) {
        console.error("[api/game/sync] ERROR:", e);
        return Response.json(
            { ok: false, message: e?.message ?? String(e) },
            { status: 500 }
        );
    }
}
