
import { GameItem, GameType } from '@/types/game';

// Define the logical mapping between requested rules and existing types
const TYPE_MAPPING: Record<string, GameType[]> = {
    choice_ab: ['balance_light', 'balance_love', 'balance_spicy'],
    pick_person: ['vote_image', 'vote_praise', 'vote_blind', 'vote_signal', 'vote_fun'],
    action_game: ['mission_action', 'mission_coop', 'roulette_punishment']
};

export class GameMixer {
    private validThemePool: GameItem[];
    private validCommonPool: GameItem[];
    private history: string[] = [];
    private lastType: GameType | null = null;
    private roundsSinceAction: number = 999;
    private maxHistory: number = 10;

    constructor(themeData: GameItem[], commonData: GameItem[]) {
        this.validThemePool = this.validate(themeData, 'Theme');
        this.validCommonPool = this.validate(commonData, 'Common');
    }

    /**
     * Filters game items based on strict validation rules.
     * Logs excluded items to the console.
     */
    private validate(pool: GameItem[], source: string): GameItem[] {
        return pool.filter(item => {
            // Basic structural validation only
            if (!item.question || !item.type) {
                console.warn(`[GameMixer] Invalid Item in ${source}: Missing question or type`, item);
                return false;
            }
            return true;
        });
    }

    private getRuleType(type: GameType): string | null {
        for (const [key, types] of Object.entries(TYPE_MAPPING)) {
            if (types.includes(type)) return key;
        }
        return null;
    }

    /**
     * Gets the next valid game item based on mixer logic.
     */
    public getNextGame(playerCount: number, currentThemeId: string): GameItem | null {
        this.roundsSinceAction++;

        const isSenior = ['reply7080', 'bravo_life', 'retro7080', 'goldenlife'].includes(currentThemeId);

        // Categorize Pools
        // Theme Pool contains both "Theme Games" (Balance/Questions) and "Person Games" (Vote)
        const themeBalanceGames = this.validThemePool.filter(g => !g.type.startsWith('vote_'));
        const themeVoteGames = this.validThemePool.filter(g => g.type.startsWith('vote_'));
        const commonGames = this.validCommonPool;

        let targetPool: GameItem[] = [];
        const r = Math.random();

        if (isSenior) {
            // Senior: 80% Balance, 20% Vote, 0% Common
            if (r < 0.8) {
                targetPool = themeBalanceGames;
                // Fallback if empty
                if (targetPool.length === 0) targetPool = themeVoteGames;
            } else {
                targetPool = themeVoteGames;
                // Fallback if empty
                if (targetPool.length === 0) targetPool = themeBalanceGames;
            }
        } else {
            // General: 70% Balance, 15% Vote, 15% Common
            if (r < 0.7) {
                targetPool = themeBalanceGames;
                if (targetPool.length === 0) targetPool = themeVoteGames.length > 0 ? themeVoteGames : commonGames;
            } else if (r < 0.85) { // 70% ~ 85% (15%)
                targetPool = themeVoteGames;
                if (targetPool.length === 0) targetPool = themeBalanceGames.length > 0 ? themeBalanceGames : commonGames;
            } else { // 85% ~ 100% (15%)
                targetPool = commonGames;
                if (targetPool.length === 0) targetPool = themeBalanceGames.length > 0 ? themeBalanceGames : themeVoteGames;
            }
        }

        // Final Safety Fallback: Use everything if target is still empty
        if (targetPool.length === 0) {
            targetPool = [...this.validThemePool, ...this.validCommonPool];
        }

        // Filter Candidates from the selected target pool
        let candidates = this.filterCandidates(targetPool, playerCount);

        // If specific pool filtered to nothing, try broadening to the whole allowed set
        if (candidates.length === 0) {
            // Senior: Try all theme pool
            // General: Try all theme + common
            const fallbackAll = isSenior ? [...this.validThemePool] : [...this.validThemePool, ...this.validCommonPool];
            // Reset history to allow repeats if we are drastically out of options
            if (this.filterCandidates(fallbackAll, playerCount).length === 0) {
                this.history = [];
            }
            candidates = this.filterCandidates(fallbackAll, playerCount);
        }

        if (candidates.length === 0) return null;

        // Pick Random
        const selected = candidates[Math.floor(Math.random() * candidates.length)];

        // Update State
        this.updateState(selected);

        return selected;
    }

    private filterCandidates(pool: GameItem[], playerCount: number): GameItem[] {
        return pool.filter(item => {
            const ruleType = this.getRuleType(item.type);

            // Rule: Player Count < 3 => pick_person BANNED
            if (playerCount < 3 && ruleType === 'pick_person') {
                return false;
            }

            // Rule: Anti-Repetition (Type)
            // The same game_type cannot appear twice in a row
            if (this.lastType === item.type) {
                return false;
            }

            // Rule: Anti-Repetition (ID)
            // Check if ID is in history (assuming question or derived ID is unique enough if ID field missing in GameItem interface)
            // GameItem interface in explicit file view shows 'question', 'type', 'options', 'timer'. No 'id'.
            // Use question as unique ID.
            if (this.history.includes(item.question)) {
                return false;
            }

            // Rule: Action Limit
            // action_game cannot appear more than once every 3 rounds.
            if (ruleType === 'action_game' && this.roundsSinceAction < 3) {
                return false;
            }

            return true;
        });
    }

    private updateState(item: GameItem) {
        // Update History
        this.history.push(item.question);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }

        // Update Last Type
        this.lastType = item.type;

        // Update Action Counter
        const ruleType = this.getRuleType(item.type);
        if (ruleType === 'action_game') {
            this.roundsSinceAction = 0;
        }
    }

    // New Helper: Get game type string for debugging
    public getGameType(item: GameItem): string | null {
        return this.getRuleType(item.type);
    }
}
