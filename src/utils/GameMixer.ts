
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

        // 1. Determine Source Pool (Theme vs Common)
        let useTheme = true;
        const random = Math.random();

        // Ratio Logic
        // Senior Themes: 100% Theme (No Common)
        if (['reply7080', 'bravo_life', 'retro7080', 'goldenlife'].includes(currentThemeId)) {
            useTheme = true;
        } else if (currentThemeId === 'drinking' || currentThemeId === 'party') {
            // 70% Theme / 30% Common
            if (random > 0.7) useTheme = false;
        } else {
            // 80% Theme / 20% Common
            if (random > 0.8) useTheme = false;
        }

        // 2. Select Candidate Pool
        let primaryPool = useTheme ? this.validThemePool : this.validCommonPool;
        let secondaryPool = useTheme ? this.validCommonPool : this.validThemePool;

        // Special restriction for Senior Themes: Secondary Pool (Common) is BANNED
        if (['reply7080', 'bravo_life', 'retro7080', 'goldenlife'].includes(currentThemeId)) {
            secondaryPool = []; // Empty the fallback pool effectively
        }

        // 3. Filter Candidates
        let candidates = this.filterCandidates(primaryPool, playerCount);

        // Fallback if no candidates in primary
        if (candidates.length === 0) {
            candidates = this.filterCandidates(secondaryPool, playerCount);
        }

        // Final fallback: if absolutely nothing
        if (candidates.length === 0) {
            // If Senior theme, only recycle Theme Pool
            const isSenior = ['reply7080', 'bravo_life', 'retro7080', 'goldenlife'].includes(currentThemeId);

            // Clear history to allow repeats
            this.history = [];

            const all = isSenior ? [...this.validThemePool] : [...this.validThemePool, ...this.validCommonPool];
            candidates = this.filterCandidates(all, playerCount);
        }

        if (candidates.length === 0) return null;

        // 4. Pick Random
        const selected = candidates[Math.floor(Math.random() * candidates.length)];

        // 5. Update State
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
