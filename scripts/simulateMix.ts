import { GAME_DATA } from '../src/data/gameData';
import { buildMixPool, getThemeMixPreset } from '../src/lib/games.engine';
import { MixContext, RuleType, getRuleType, pickNextGame } from '../src/utils/GameMixer';

const themeId = process.argv[2] ?? 'icebreaking';
const playerCount = Number(process.argv[3] ?? 4);
const rounds = Number(process.argv[4] ?? 500);

const themeCategory = GAME_DATA.categories.find(category => category.id === themeId);
const commonCategory = GAME_DATA.categories.find(category => category.id === 'common');

if (!themeCategory) {
    console.error(`Unknown theme: ${themeId}`);
    process.exit(1);
}

const preset = getThemeMixPreset(themeId);
const pool = buildMixPool(themeCategory, commonCategory);

const ctx: MixContext = {
    recentTypes: [],
    recentIds: []
};

const counts: Record<RuleType, number> = {
    choice_ab: 0,
    pick_person: 0,
    action_game: 0
};

let generated = 0;

for (let i = 0; i < rounds; i++) {
    const game = pickNextGame(pool, { weights: preset.weights, playerCount }, ctx);
    if (!game) {
        console.warn(`Stopped early at round ${i + 1}: no valid game found.`);
        break;
    }

    const ruleType = getRuleType(game.type);
    if (ruleType) {
        counts[ruleType] += 1;
    }

    generated += 1;
}

console.log(`Theme: ${themeId}`);
console.log(`Players: ${playerCount}`);
console.log(`Rounds requested: ${rounds}`);
console.log(`Rounds generated: ${generated}`);

const entries = Object.entries(counts) as Array<[RuleType, number]>;
entries.forEach(([type, count]) => {
    const percent = generated > 0 ? ((count / generated) * 100).toFixed(2) : '0.00';
    console.log(`- ${type}: ${count} (${percent}%)`);
});
