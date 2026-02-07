import { GAME_DATA } from '@/data/gameData';
import { GameItem } from '@/types/game';

// Helper to generate consistent ID for games without one
// Must match logic in /api/game/turn if that generates IDs
export function generateGameId(question: string): string {
    // Simple hash or base64
    // Using simple base64 for now, handling Unicode
    try {
        return btoa(unescape(encodeURIComponent(question))).substring(0, 8);
    } catch (e) {
        return Math.random().toString(36).substring(7);
    }
}

// Build a fast lookup map
const gameMap = new Map<string, GameItem & { category: string }>();
let isInitialized = false;

function initGameMap() {
    if (isInitialized) return;

    GAME_DATA.categories.forEach(cat => {
        cat.games.forEach(game => {
            const id = game.id || generateGameId(game.question);
            gameMap.set(id, { ...game, id, category: cat.id });
        });
    });

    isInitialized = true;
}

export function findGameById(id: string | null): (GameItem & { category: string }) | null {
    if (!id) return null;
    initGameMap();
    return gameMap.get(id) || null;
}
