import { NextResponse } from 'next/server';
import { GAME_DATA } from '@/data/gameData';
import { buildMixPool, getThemeMixPreset } from '@/lib/games.engine';
import { MixContext, pickNextGame } from '@/utils/GameMixer';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const themeId = searchParams.get('theme') || 'icebreaking';
    const countStr = searchParams.get('count') || '4';
    const reset = searchParams.get('reset') === 'true';
    const playerCount = parseInt(countStr, 10);
    const recentTypesParam = searchParams.get('recentTypes');
    const recentIdsParam = searchParams.get('recentIds');

    try {
        console.log(`[API] Generating turn for Theme: ${themeId}, Players: ${playerCount}, Reset: ${reset}`);

        // 1. Get Theme Data
        const themeCategory = GAME_DATA.categories.find(c => c.id === themeId);
        const commonCategory = GAME_DATA.categories.find(c => c.id === 'common');

        if (!themeCategory) {
            throw new Error(`Theme '${themeId}' not found`);
        }

        const mixPreset = getThemeMixPreset(themeId);
        const pool = buildMixPool(themeCategory, commonCategory).map(game =>
            game.id
                ? game
                : {
                    ...game,
                    id: Buffer.from(game.question).toString('base64').substring(0, 8)
                }
        );
        console.log(`[API] Mix pool size: ${pool.length}`);

        // 3. Generate 12 Games (3 Rounds * 4 Games)
        const turnData = [];
        const ctx: MixContext = {
            recentTypes: [],
            recentIds: []
        };

        if (recentTypesParam) {
            try {
                const parsed = JSON.parse(recentTypesParam);
                if (Array.isArray(parsed)) {
                    ctx.recentTypes = parsed.filter(type => type === 'choice_ab' || type === 'pick_person' || type === 'action_game');
                }
            } catch {
                console.warn('[API] Failed to parse recentTypes param');
            }
        }

        if (recentIdsParam) {
            try {
                const parsed = JSON.parse(recentIdsParam);
                if (Array.isArray(parsed)) {
                    ctx.recentIds = parsed.filter(id => typeof id === 'string');
                }
            } catch {
                console.warn('[API] Failed to parse recentIds param');
            }
        }

        if (reset) {
            ctx.recentIds = [];
            ctx.recentTypes = [];
        }

        for (let i = 0; i < 12; i++) {
            const game = pickNextGame(pool, { weights: mixPreset.weights, playerCount }, ctx);
            if (game) {
                const id = game.id || Buffer.from(game.question).toString('base64').substring(0, 8);
                const gameWithId = {
                    ...game,
                    id,
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
