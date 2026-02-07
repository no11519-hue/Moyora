
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
            const ruleType = this.getRuleType(item.type);
            let isValid = true;
            let failureReason = '';

            // Normalize content for length check (remove spaces and special chars)
            const normalizedQuestion = item.question ? item.question.replace(/[\s?!.,~]/g, '') : '';
            const questionLen = normalizedQuestion.length;

            if (ruleType === 'choice_ab') {
                // Rule: Question Length 8 ~ 10 char
                if (questionLen < 8 || questionLen > 10) {
                    isValid = false;
                    failureReason = `Question length ${questionLen} (Strict 8-10)`;
                }

                // Rule: Options 4 ~ 6 char
                if (item.options && item.options.length === 2) {
                    for (const opt of item.options) {
                        const normOpt = opt.replace(/[\s?!.,~()]/g, '');
                        if (normOpt.length < 4 || normOpt.length > 6) {
                            isValid = false;
                            failureReason = `Option length ${normOpt.length} ('${opt}') (Strict 4-6)`;
                            break;
                        }
                    }
                } else {
                    isValid = false;
                    failureReason = 'Must have exactly 2 options';
                }

            } else if (ruleType === 'pick_person') {
                // Rule: Question Length Strictly 10 char
                if (questionLen !== 10) {
                    isValid = false;
                    failureReason = `Question length ${questionLen} (Strict 10)`;
                }

                // Rule: Forbidden Word "오늘은"
                if (item.question.includes("오늘은")) {
                    isValid = false;
                    failureReason = 'Contains forbidden word "오늘은"';
                }

            } else if (ruleType === 'action_game') {
                // Rule: Question Length 8 ~ 12 char
                if (questionLen < 8 || questionLen > 12) {
                    isValid = false;
                    failureReason = `Question length ${questionLen} (Strict 8-12)`;
                }

                // Rule: Forbidden Word "오늘은"
                if (item.question.includes("오늘은")) {
                    isValid = false;
                    failureReason = 'Contains forbidden word "오늘은"';
                }

                // Rule: Penalty must be "한잔" 
                // Note: Penalty is often part of the description or separate field. 
                // Assuming it's part of the question string or we check metadata if available.
                // The prompt says "Penalty: Must be hardcoded to '한잔'". 
                // Since GameItem may not have penalty field, we check if the question implies it or just enforce logic.
                // If the prompt implies checking for the *presence* of penalty text:
                // However, previous data has "(벌칙: 한잔)". Let's check for "한잔".
                if (!item.question.includes("한잔")) {
                    isValid = false;
                    failureReason = 'Penalty must be "한잔" (missing in text)';
                }
            }

            if (!isValid) {
                console.warn(`[GameMixer] Excluded (${source}): "${item.question}" - Reason: ${failureReason}`);
            }

            return isValid;
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
        if (currentThemeId === 'drinking' || currentThemeId === 'party') {
            // 70% Theme / 30% Common
            if (random > 0.7) useTheme = false;
        } else {
            // 80% Theme / 20% Common
            if (random > 0.8) useTheme = false;
        }

        // 2. Select Candidate Pool
        // Prefer the chosen pool, but fallback if empty
        let primaryPool = useTheme ? this.validThemePool : this.validCommonPool;
        let secondaryPool = useTheme ? this.validCommonPool : this.validThemePool;

        // 3. Filter Candidates
        let candidates = this.filterCandidates(primaryPool, playerCount);

        // Fallback if no candidates in primary
        if (candidates.length === 0) {
            candidates = this.filterCandidates(secondaryPool, playerCount);
        }

        // Final fallback: if absolutely nothing, clear history and try again from all
        if (candidates.length === 0) {
            this.history = [];
            const all = [...this.validThemePool, ...this.validCommonPool];
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
