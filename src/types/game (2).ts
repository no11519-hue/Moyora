
export type GameType =
    | 'vote_blind'
    | 'talk_tmi'
    | 'vote_image'
    | 'balance_light'
    | 'vote_signal'
    | 'balance_love'
    | 'talk_deep'
    | 'vote_praise'
    | 'talk_vision'
    | 'mission_coop'
    | 'vote_fun'
    | 'balance_spicy'
    | 'roulette_punishment'
    | 'mission_action';

export interface GameItem {
    type: GameType;
    question: string;
    options?: string[];
    timer: number;
}

export interface GameCategory {
    id: string;
    title: string;
    description: string;
    games: GameItem[];
}

export interface GameData {
    categories: GameCategory[];
}
