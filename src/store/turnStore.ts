
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
                    const res = await fetch(url);
                    const data = await res.json();

                    if (data.turnData && Array.isArray(data.turnData)) {
                        set({ queue: data.turnData, currentIndex: -1 });
                    }
                } catch (e) {
                    console.error("Failed to fetch turn", e);
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

                    // @ts-ignore - Supabase types might not perfectly match upsert if generated types are strict
                    const { error } = await supabase.from('questions').upsert(payload);

                    if (error) {
                        console.error("Question Upsert Error:", error);
                        // If distinct error, allow continue? No, FK will fail.
                        // Assuming ID is compatible string.
                    }
                } catch (e) {
                    console.error("Upsert Exception", e);
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
