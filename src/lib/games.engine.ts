// ==========================
// 게임 진행 엔진 (로직)
// ==========================
import { GAME_DB, Game, GameType, QuestionGame, ChoiceGame } from '@/data/games.db';

export type SessionState = {
    usedIds: Set<string>;
    rngSeed: number;
};

// ==========================
// 유틸: 시드 랜덤 & 헬퍼
// ==========================
function mulberry32(seed: number) {
    return function () {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function pickRandom<T>(arr: T[], rnd: () => number): T | null {
    if (arr.length === 0) return null;
    const idx = Math.floor(rnd() * arr.length);
    return arr[idx];
}

function filterUnused(db: Game[], used: Set<string>) {
    return db.filter(g => !used.has(g.id));
}

// ==========================
// 입력 검증 (질문형)
// ==========================
export function validateShortAnswer(input: string): { ok: boolean; cleaned: string } {
    const cleaned = (input || "").replace(/\s+/g, "");
    const len = cleaned.length;
    return { ok: len >= 3 && len <= 4, cleaned };
}

// ==========================
// 턴 생성기 (1턴 = 3라운드, 라운드당 선택3+질문1)
// ==========================

// 라운드 구성 생성
function generateRound(pool: Game[], rnd: () => number): { roundGames: Game[]; remainingPool: Game[] } {
    // 풀 분리
    const qPool = pool.filter((g): g is QuestionGame => g.type === "Q");
    const cPool = pool.filter((g): g is ChoiceGame => g.type === "C");

    const picked: Game[] = [];

    // 1. 선택형 3개 뽑기
    // 다양한 테마를 위해 셔플 후 선택하거나, 단순히 랜덤 3개
    let currentCPool = [...cPool];
    for (let i = 0; i < 3; i++) {
        const choice = pickRandom(currentCPool, rnd);
        if (choice) {
            picked.push(choice);
            currentCPool = currentCPool.filter(g => g.id !== choice.id);
        }
    }

    // 2. 질문형 1개 뽑기
    // 라운드 내 선택형들과 테마가 겹치지 않도록 우선 시도
    const pickedThemes = new Set(picked.map(g => g.theme));
    const preferredQPool = qPool.filter(q => !pickedThemes.has(q.theme));

    // 선호 풀이 있으면 거기서, 없으면 전체 Q풀에서
    let finalQPool = preferredQPool.length > 0 ? preferredQPool : qPool;

    const question = pickRandom(finalQPool, rnd);
    if (question) {
        picked.push(question);
    }

    // 결과: 4개 (C,C,C,Q 순서로 리턴)
    // 사용된 게임 제외한 새 풀 반환
    const usedIdsInRound = new Set(picked.map(g => g.id));
    const remainingPool = pool.filter(g => !usedIdsInRound.has(g.id));

    return { roundGames: picked, remainingPool };
}

export function generateTurn(session: SessionState) {
    const rnd = mulberry32(session.rngSeed);
    let pool = filterUnused(GAME_DB, session.usedIds);

    const allGames: Game[] = [];

    // 3라운드 진행
    for (let r = 1; r <= 3; r++) {
        // 남은 풀이 너무 적으면 리셋 로직 필요 (외부에서 처리하거나 여기서 에러)
        // 일단 진행
        const { roundGames, remainingPool } = generateRound(pool, rnd);

        roundGames.forEach(g => {
            session.usedIds.add(g.id);
            allGames.push(g);
        });

        pool = remainingPool;
    }

    // 시드 업데이트
    session.rngSeed = Math.floor(rnd() * 1e9);

    return allGames; // 12개 (4x3) 리턴
}

// ==========================
// 출력 포맷터 (UI용)
// ==========================
export function formatTurn(games: Game[]) {
    // 12개 게임을 4개씩 끊어서 라운드 표시
    const rounds = [];
    for (let i = 0; i < games.length; i += 4) {
        rounds.push(games.slice(i, i + 4));
    }

    let output = "=== 1턴 시작 ===\n\n";

    rounds.forEach((roundGames, rIdx) => {
        output += `=== 1턴 / 라운드 ${rIdx + 1} (선택3 + 서술1) ===\n`;

        roundGames.forEach((g, gIdx) => {
            // 전체 번호 (1~12)
            const globalNum = (rIdx * 4) + gIdx + 1;

            output += `${globalNum}) [${g.theme}] (${g.type === 'C' ? '선택형' : '서술질문'}) ⏱ ${g.timeSec}초\n`;
            if (g.type === 'C') {
                output += `- A: ${g.A}\n- B: ${g.B}\n→ 10초! A/B 고르세요.\n`;
            } else {
                output += `- 질문: ${g.prompt}\n- 규칙: 공백 없이 3~4글자\n→ 20초! 3~4글자로 입력하세요.\n`;
            }
            output += "\n";
        });
    });

    output += "=== 1턴 종료 ===\n“다음 턴”이라고 입력하면 2턴(라운드1~3)을 같은 규칙으로 생성합니다.";
    return output;
}
