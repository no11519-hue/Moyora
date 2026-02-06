
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

        // 데이터 검증 및 Upsert
        const { error } = await supabaseAdmin
            .from('questions')
            .upsert(body);

        if (error) {
            console.error('Supabase Upsert Error:', error);
            // 에러 코드 반환 (22P02: invalid input syntax for type uuid 등)
            return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('Sync API Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
