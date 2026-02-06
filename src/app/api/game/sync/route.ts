
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Database } from '@/types/database.types';

export async function POST(request: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 키가 없으면, 개발 환경일 수 있으니 로그 남기고 에러 반환
    if (!serviceRoleKey) {
        console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
        return NextResponse.json({
            error: 'Server configuration error: Missing Service Role Key. Please add it to .env.local'
        }, { status: 500 });
    }

    // Admin 클라이언트 생성 (RLS 우회)
    const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        const body = await request.json();

        // 데이터 매핑
        // Client sends game object directly or fields
        // { id, category, type, content, timer, options }
        // We need to map `id` -> `code`
        // And map `type` -> `balance_light` / `talk_tmi`

        const { id: gameCode, category, type, content, timer, options } = body;

        // Type Mapping
        // 만약 이미 매핑된 값이 들어오면 그대로, 아니면 변환
        let dbType = type;
        if (type === 'C') dbType = 'balance_light';
        else if (type === 'Q') dbType = 'talk_tmi';
        else if (type === 'balance_light' || type === 'talk_tmi') dbType = type; // already mapped

        // Payload for DB
        const dbPayload = {
            code: gameCode, // 'IB_Q01' etc.
            category, // 'icebreaking' etc. (Assumed client sends correct category string? No, client sends '아이스브레이킹')
            // Client (turnStore) sends raw Game object fields.
            // turnStore에서 category 변환 로직이 없으면 여기서 해야 함.
            // 하지만 turnStore 코드를 보면 `category: game.theme` 를 보냄. ("아이스브레이킹")
            // DB에 "아이스브레이킹" 이라고 넣으면 되는가?
            // 시딩 스크립트는 "icebreaking"으로 변환했음.
            // API도 변환해주는 게 맞음.

            content,
            type: dbType,
            timer,
            options: typeof options === 'string' ? JSON.parse(options) : options // ensure array
        };

        // Category Mapping
        if (dbPayload.category === '아이스브레이킹') dbPayload.category = 'icebreaking';
        else if (dbPayload.category === '소개팅·미팅') dbPayload.category = 'dating';
        else if (dbPayload.category === '회식·술자리') dbPayload.category = 'drinking';
        else if (dbPayload.category === '크루모드') dbPayload.category = 'crewmode';

        // Upsert using 'code'
        const { data, error } = await supabaseAdmin
            .from('questions')
            .upsert(dbPayload, { onConflict: 'code' })
            .select('id')
            .single();

        if (error) {
            console.error('Supabase Upsert Error:', error);
            return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
        }

        return NextResponse.json({ success: true, id: data.id }); // Return UUID
    } catch (e: any) {
        console.error('Sync API Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
