import { NextResponse } from 'next/server';
import { generateTurn, formatTurn } from '@/lib/games.engine';
import { GAME_DB } from '@/data/games.db';

// 간단한 인-메모리 세션 (서버리스 환경에서는 완벽하지 않지만 데모용)
// 실제로는 DB나 Redis에 저장해야 함
let mockSession = {
    usedIds: new Set<string>(),
    rngSeed: Date.now()
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const reset = searchParams.get('reset');

    if (reset) {
        mockSession.usedIds.clear();
        mockSession.rngSeed = Date.now();
        return NextResponse.json({ message: 'Session reset' });
    }

    // 턴 생성
    const turn = generateTurn(mockSession);

    // DB 모두 소진 시 리셋
    if (turn.length < 12) {
        mockSession.usedIds.clear();
        // 남은 개수 부족하면 리셋 후 다시 시도 로직 필요하지만 여기선 생략
    }

    // 포맷팅된 텍스트와 원본 JSON 모두 반환
    return NextResponse.json({
        turnData: turn,
        displayText: formatTurn(turn),
        remaining: GAME_DB.length - mockSession.usedIds.size
    });
}
