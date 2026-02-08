import { GAME_DATA } from '../src/data/gameData';
import { buildMixPool, getSessionTargetCounts } from '../src/lib/games.engine';
import { MixContext, RuleType, getRuleType, pickNextGame } from '../src/utils/GameMixer';

const themeId = process.argv[2] ?? 'icebreaking';
const playerCount = Number(process.argv[3] ?? 4);
const sessions = Number(process.argv[4] ?? 200);
const itemsPerSession = 25;

const themeCategory = GAME_DATA.categories.find(category => category.id === themeId);
const commonCategory = GAME_DATA.categories.find(category => category.id === 'common');

if (!themeCategory) {
    console.error(`Unknown theme: ${themeId}`);
    process.exit(1);
}

const pool = buildMixPool(themeCategory, commonCategory);
const hasActionGame = pool.some(game => getRuleType(game.type) === 'action_game');
const hasPickPerson = pool.some(game => getRuleType(game.type) === 'pick_person');
const targetCounts = getSessionTargetCounts({
    playerCount,
    hasPickPerson,
    hasActionGame
});

const counts: Record<RuleType, number> = {
    choice_ab: 0,
    pick_person: 0,
    action_game: 0
};

let generated = 0;

for (let session = 0; session < sessions; session++) {
    const ctx: MixContext = {
        recentTypes: [],
        recentIds: [],
        remainingCounts: { ...targetCounts }
    };

    for (let i = 0; i < itemsPerSession; i++) {
        const game = pickNextGame(pool, { targetCounts, playerCount }, ctx);
        if (!game) {
            console.warn(`Stopped early at session ${session + 1}, item ${i + 1}: no valid game found.`);
            break;
        }

        const ruleType = getRuleType(game.type);
        if (ruleType) {
            counts[ruleType] += 1;
        }

        generated += 1;
    }
}

console.log(`Theme: ${themeId}`);
console.log(`Players: ${playerCount}`);
console.log(`Sessions: ${sessions}`);
console.log(`Items per session: ${itemsPerSession}`);
console.log(`Rounds generated: ${generated}`);

const entries = Object.entries(counts) as Array<[RuleType, number]>;
entries.forEach(([type, count]) => {
    const percent = generated > 0 ? ((count / generated) * 100).toFixed(2) : '0.00';
    console.log(`- ${type}: ${count} (${percent}%)`);
});
