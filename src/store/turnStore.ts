
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
                    // Turn Ended (No more games in queue)
                    return false;
                }

                const game = queue[nextIdx];

                // Sync to Supabase
                // 1. Upsert question to DB
                // Note: 'id' in questions table is 'text' (string). If it's uuid in real DB, this might fail.
                try {
                    const payload = {
                        id: game.id,
                        category: game.theme,
                        type: game.type,
                        content: game.prompt,
                        timer: game.timeSec,
                        options: game.type === 'C' ? JSON.stringify([game.A, game.B]) : null
                    };

                    // @ts-ignore
                    const { error } = await supabase.from('questions').upsert(payload);

                    if (error) {
                        console.error("Question Upsert Error:", error);
                        // If error is code 23505 (unique violation), it's fine for upsert, but other errors like UUID format?
                        if (error.code === '22P02') { // invalid input syntax for type uuid
                            alert(`DB 오류: ID 포맷이 UUID가 아닙니다. (${game.id})`);
                            return false;
                        }
                        alert(`질문 등록 실패: ${error.message} (${error.code})`);
                        // Don't return false here, try to proceed? No, FK will fail.
                        return false;
                    }
                } catch (e: any) {
                    console.error("Upsert Exception", e);
                    alert(`질문 등록 중 예외 발생: ${e.message}`);
                    return false;
                }

                // 2. Update Room
                await supabase.from('rooms').update({
                    current_question_id: game.id,
                    status: 'playing',
                    // We can also store round info if room table had columns, but we don't.
                } as any).eq('id', roomId);

                set({ currentIndex: nextIdx });
                return true;
            },

            reset: () => set({ queue: [], currentIndex: -1 })
        }),
        {
            name: 'moyora-turn-engine', // storage key
        }
    )
);
