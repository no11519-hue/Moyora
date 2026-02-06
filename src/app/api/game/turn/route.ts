import { NextResponse } from 'next/server';
import { generateTurn, formatTurn } from '@/lib/games.engine';
import { GAME_DB } from '@/data/games.db';

// 간단한 인-메모리 세션 (서버리스 환경에서는 완벽하지 않지만 데모용)
// 실제로는 DB나 Redis에 저장해야 함
let mockSession = {
    usedIds: new Set<string>(),
    rngSeed: Date.now()
};

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const reset = searchParams.get('reset');

    if (reset) {
        mockSession.usedIds.clear();
        mockSession.rngSeed = Date.now();
        // proceed to generate new turn
    }

    try {
        console.log(`[API] Generating turn... Seed: ${mockSession.rngSeed}, Used: ${mockSession.usedIds.size}`);

        if (!GAME_DB || GAME_DB.length === 0) {
            throw new Error("GAME_DB is empty or undefined");
        }

        // 턴 생성 (12개 게임: 3라운드 * 4개)
        const turn = generateTurn(mockSession);

        console.log(`[API] Turn generated with ${turn?.length} games`);

        if (!turn) {
            throw new Error("generateTurn returned null/undefined");
        }

        // DB 소진 시 (12개 미만으로 뽑힌 경우)
        if (turn.length < 12) {
            mockSession.usedIds.clear();
            // 실제로는 여기서 다시 뽑거나, 사용자에게 "다음 턴에 리셋됩니다" 알림
        }

        // 포맷팅된 텍스트와 원본 JSON 모두 반환
        return NextResponse.json({
            turnData: turn,
            displayText: formatTurn(turn),
            remaining: GAME_DB.length - mockSession.usedIds.size
        });
    } catch (e: any) {
        console.error("[API] Error generating turn:", e);
        // 에러 상황 명시
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
