
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Game } from '@/data/games.db';
import { supabase } from '@/lib/supabase';

interface TurnState {
    queue: Game[];
    currentIndex: number; // 0 to 11

    // Actions
    fetchTurn: (reset?: boolean) => Promise<void>;
    playNextGame: (roomId: string) => Promise<boolean>; // Returns false if turn ended
    reset: () => void;
}

export const useTurnStore = create<TurnState>()(
    persist(
        (set, get) => ({
            queue: [],
            currentIndex: -1,

            fetchTurn: async (reset = false) => {
                try {
                    const url = reset ? '/api/game/turn?reset=true' : '/api/game/turn';
                    console.log(`[TurnStore] Fetching turn from ${url}...`);
                    const res = await fetch(url);

                    if (!res.ok) {
                        const text = await res.text();
                        console.error(`[TurnStore] API Error: ${res.status} ${text}`);
                        throw new Error(`API 오류: ${res.status}`);
                    }

                    const data = await res.json();
                    console.log('[TurnStore] Received data:', data);

                    if (data.turnData && Array.isArray(data.turnData)) {
                        set({ queue: data.turnData, currentIndex: -1 });
                    } else {
                        console.error('[TurnStore] Invalid data format:', data);
                        throw new Error("데이터 형식이 올바르지 않습니다.");
                    }
                } catch (e: any) {
                    console.error("Failed to fetch turn", e);
                    alert(`게임 데이터를 불러오지 못했습니다: ${e.message}`);
                }
            },

            playNextGame: async (roomId: string) => {
                const { queue, currentIndex } = get();
                const nextIdx = currentIndex + 1;

                if (nextIdx >= queue.length) {
                    // Turn Ended
                    return false;
                }

                const game = queue[nextIdx];

                // 1. Sync to Supabase via Admin API (to bypass RLS)
                try {
                    const payload = {
                        id: game.id,
                        category: game.theme,
                        type: game.type,
                        content: game.prompt,
                        timer: game.timeSec,
                        options: game.type === 'C' ? JSON.stringify([game.A, game.B]) : null
                    };

                    const syncRes = await fetch('/api/game/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (!syncRes.ok) {
                        const errData = await syncRes.json();
                        console.error("Sync API Error:", errData);

                        if (errData.code === '22P02') {
                            alert(`[치명적 오류] DB ID 타입 불일치\nDB는 UUID만 받는데, 게임 ID는 문자열(${game.id})입니다.\n개발자에게 문의하세요.`);
                            return false;
                        }

                        if (syncRes.status === 500 && errData.error?.includes('Missing Service Role Key')) {
                            alert(`[설정 오류] 서버에 Service Role Key가 없습니다.\n.env.local 파일을 확인하세요.`);
                            return false;
                        }

                        // Code 23505 = Unique Violation (already exists) -> Ignore and proceed
                        if (errData.code === '23505') {
                            // Already exists, fine.
                        } else {
                            throw new Error(errData.error || 'Unknown Sync Error');
                        }
                    }
                } catch (e: any) {
                    console.error("Sync Exception", e);
                    alert(`게임 질문 동기화 실패: ${e.message}`);
                    return false;
                }

                // 2. Update Room (Client should have permission to update room)
                const { error: roomError } = await supabase.from('rooms').update({
                    current_question_id: game.id,
                    status: 'playing',
                } as any).eq('id', roomId);

                if (roomError) {
                    console.error("Room Update Error:", roomError);
                    alert(`방 상태 업데이트 실패(RLS?): ${roomError.message}`);
                    return false;
                }

                set({ currentIndex: nextIdx });
                return true;
            },

            reset: () => set({ queue: [], currentIndex: -1 })
        }),
        {
            name: 'moyora-turn-engine',
        }
    )
);
