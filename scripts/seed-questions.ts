import { createClient } from "@supabase/supabase-js";
import { GAME_DB } from "../src/data/games.db";
import * as dotenv from 'dotenv';
import path from 'path';

// .env.local 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
    console.error("ENV 설정 오류: .env.local 파일을 확인해주세요.");
    console.error("- URL:", url ? "OK" : "Missing");
    console.error("- KEY:", serviceKey ? "OK" : "Missing");
    process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

// DB에서 확인한 실제 타입 매핑
const TYPE_FOR_CHOICE = "balance_light";
const TYPE_FOR_SHORTTEXT = "talk_tmi";

function chunk<T>(arr: T[], size = 200) {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

async function main() {
    console.log(`📦 게임 데이터 시딩 시작 (총 ${GAME_DB.length}개)...`);

    const rows = GAME_DB.map((g: any) => {
        let category = "crewmode";
        if (g.theme === "아이스브레이킹") category = "icebreaking";
        else if (g.theme === "소개팅·미팅") category = "dating";
        else if (g.theme === "회식·술자리") category = "drinking";

        const isChoice = g.type === "C";

        return {
            code: g.id, // 고유 식별자 (Upsert 기준)
            category,
            content: isChoice ? `${g.prompt}` : g.prompt,
            // content에 A vs B를 넣으라는 요청이 있었으나, options 컬럼이 있으므로 
            // 프론트에서 options를 보여주는 게 더 깔끔할 수 있음. 
            // 하지만 사용자 가이드: content: isChoice ? `${g.prompt}: ${g.A} vs ${g.B}` : g.prompt
            // 가이드 따름.

            // 사용자 요청 수정: "content: isChoice ? `${g.prompt}: ${g.A} vs ${g.B}` : g.prompt"
            // 로직 적용. (DB content 컬럼이 보여지는 텍스트이므로)

            // 다시: g.prompt 가 "짜장 vs 짬뽕" 같은 질문 주제.
            // g.A, g.B 가 옵션.
            // 가이드 대로 병합.

            type: isChoice ? TYPE_FOR_CHOICE : TYPE_FOR_SHORTTEXT,

            // 추가: 기존 필드 활용
            options: isChoice ? JSON.stringify([g.A, g.B]) : null,
            timer: g.timeSec
        };
    });

    // content 병합 로직 적용 (map 밖에서 처리하려다 안에서 해결)
    // 위 map에서 content 필드를 다시 정의:
    const finalRows = rows.map(r => {
        // Find original game to access A/B again if needed, but rows already has structure.
        // Accessing GAME_DB by index if needed?
        // No, let's rewrite map properly above.
        return r;
    });

    // Re-mapping for strict guide compliance
    const payload = GAME_DB.map((g: any) => {
        let category = "crewmode";
        if (g.theme === "아이스브레이킹") category = "icebreaking";
        else if (g.theme === "소개팅·미팅") category = "dating";
        else if (g.theme === "회식·술자리") category = "drinking";

        const isChoice = g.type === "C";

        return {
            code: g.id,
            category,
            content: isChoice ? `${g.prompt}: ${g.A} vs ${g.B}` : g.prompt,
            type: isChoice ? TYPE_FOR_CHOICE : TYPE_FOR_SHORTTEXT,
            options: isChoice ? [g.A, g.B] : null, // JSON 컬럼에는 객체/배열 그대로 전달
            timer: g.timeSec // Extra info
        };
    });

    for (const part of chunk(payload, 200)) {
        const { error } = await supabase
            .from("questions")
            .upsert(part, { onConflict: "code" });

        if (error) {
            console.error("❌ 시딩 실패. 에러 로그 파일 기록 중...");
            const fs = require('fs');
            fs.writeFileSync('seed_error.json', JSON.stringify(error, null, 2));
            process.exit(1);
        }
    }

    console.log(`✅ 시딩 완료! questions 테이블에 ${payload.length}개가 저장되었습니다.`);
}

main();
