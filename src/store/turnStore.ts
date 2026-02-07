
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Game } from '@/data/games.db';
import { supabase } from '@/lib/supabase';

interface TurnState {
    queue: Game[];
    currentIndex: number; // 0 to 11

    // Actions
    fetchTurn: (theme: string, participantsCount?: number, reset?: boolean) => Promise<void>;
    playNextGame: (roomId: string) => Promise<boolean>; // Returns false if turn ended
    reset: () => void;
}

export const useTurnStore = create<TurnState>()(
    persist(
        (set, get) => ({
            queue: [],
            currentIndex: -1,

            fetchTurn: async (theme: string = 'icebreaking', participantsCount: number = 4, reset = false) => {
                try {
                    const params = new URLSearchParams({
                        theme,
                        count: participantsCount.toString()
                    });
                    if (reset) params.append('reset', 'true');

                    const url = `/api/game/turn?${params.toString()}`;
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
                        const safeQueue = data.turnData.map((g: any) => ({
                            id: g.id || `temp-${Math.random()}`, // Fallback ID if missing
                            theme: g.theme || theme,
                            type: g.type,
                            prompt: g.question, // Map GameItem.question to prompt
                            timeSec: g.timer,   // Map GameItem.timer to timeSec
                            A: g.options ? g.options[0] : null,
                            B: g.options ? g.options[1] : null
                        })).filter((g: any) => g.type && g.prompt);

                        if (safeQueue.length > 0) {
                            set({ queue: safeQueue, currentIndex: -1 });
                        } else {
                            console.warn('[TurnStore] No valid games found after filtering');
                            throw new Error("유효한 게임 데이터가 0개입니다.");
                        }
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
                    return false;
                }

                const game = queue[nextIdx];
                const gameId = game.id; // Local JSON ID

                if (!gameId) {
                    console.error("Game ID is missing");
                    return false;
                }

                // 2. Update Room directly with Game ID from Local JSON
                // The 'rooms' table 'current_question_id' column must accept this string ID.
                // Constraint: If 'current_question_id' is a foreign key to 'questions' table (UUID), this will fail if we don't drop that FK.
                // Assuming "Stop Fetching Content from Supabase" implies we are breaking that link/FK dependence.
                // For now, try to update. If it fails due to FK, user receives error but they asked to "Stop Fetching".

                const { error: roomError } = await supabase.from('rooms').update({
                    current_question_id: gameId,
                    status: 'playing',
                } as any).eq('id', roomId);

                if (roomError) {
                    console.error("Room Update Error (FK violation likely if questions table used):", roomError);
                    alert(`방 업데이트 실패: ${roomError.message}`);
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
