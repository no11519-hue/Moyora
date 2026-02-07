import { NextResponse } from 'next/server';
import { GAME_DATA } from '@/data/gameData';
import { GameMixer } from '@/utils/GameMixer';

// Simple in-memory session (Not ideal for serverless but sufficient for MVP/Demo)
let mixerInstance: GameMixer | null = null;

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const themeId = searchParams.get('theme') || 'icebreaking';
    const countStr = searchParams.get('count') || '4';
    const reset = searchParams.get('reset') === 'true';
    const playerCount = parseInt(countStr, 10);

    try {
        console.log(`[API] Generating turn for Theme: ${themeId}, Players: ${playerCount}, Reset: ${reset}`);

        // 1. Get Theme Data
        const themeCategory = GAME_DATA.categories.find(c => c.id === themeId);
        const commonCategory = GAME_DATA.categories.find(c => c.id === 'common');

        if (!themeCategory) {
            throw new Error(`Theme '${themeId}' not found`);
        }

        // 2. Initialize Mixer (Singleton-ish for demo, or per request if stateless desired)
        // Since GameMixer is stateful (history), we should technically persist it per room.
        // However, this API is called once per 'Turn' (batch of games). 
        // We can just instantiate a new Mixer and generate a batch, but history won't persist across turns.
        // Given the requirement for '10 round cooldown', we need persistence.
        // For MVP without Redis, we'll use the global variable but reset it if 'reset=true' is passed.
        // NOTE: In serverless (Vercel), global variables may reset. But for now this follows the previous pattern.

        if (reset || !mixerInstance) {
            // Check if theme excludes common games
            const commonGames = (themeCategory.excludeCommon || !commonCategory) ? [] : commonCategory.games;

            mixerInstance = new GameMixer(
                themeCategory.games,
                commonGames
            );
            console.log(`[API] New Mixer initialized (Common Games: ${commonGames.length})`);
        }

        // 3. Generate 12 Games (3 Rounds * 4 Games)
        const turnData = [];
        for (let i = 0; i < 12; i++) {
            const game = mixerInstance!.getNextGame(playerCount, themeId);
            if (game) {
                // Add an ID if missing (GameItem usually doesn't have ID in gameData.ts)
                // We'll use a simple hash or random ID.
                const gameWithId = {
                    ...game,
                    id: game.question ? Buffer.from(game.question).toString('base64').substring(0, 8) : Math.random().toString(36).substring(7),
                    theme: themeId // Tag with current theme for context
                };
                turnData.push(gameWithId);
            }
        }

        console.log(`[API] Turn generated with ${turnData.length} games`);

        return NextResponse.json({
            turnData
        });

    } catch (e: any) {
        console.error("[API] Error generating turn:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
