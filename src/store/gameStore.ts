
import { create } from 'zustand';
import { Database } from '@/types/database.types';

type Room = Database['public']['Tables']['rooms']['Row'];
type Participant = Database['public']['Tables']['participants']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];

interface GameState {
    room: Room | null;
    participants: Participant[];
    currentUser: Participant | null;
    currentQuestion: Question | null;
    votes: any[]; // Or Database Row type

    isSeniorMode: boolean; // Derived from room.category

    setRoom: (room: Room) => void;
    setParticipants: (participants: Participant[]) => void;
    setCurrentUser: (user: Participant) => void;
    setCurrentQuestion: (question: Question | null) => void;
    setVotes: (votes: any[]) => void;
    reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
    room: null,
    participants: [],
    currentUser: null,
    currentQuestion: null,
    votes: [], // Store standard votes globally
    isSeniorMode: false,

    setRoom: (room) => {
        const seniorThemes = ['reply7080', 'bravo_life', 'retro7080', 'goldenlife'];
        const isSenior = seniorThemes.includes(room.category);
        set({ room, isSeniorMode: isSenior });
    },
    setParticipants: (participants) => set({ participants }),
    setCurrentUser: (currentUser) => set({ currentUser }),
    setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),
    setVotes: (votes) => set({ votes }),
    reset: () => set({ room: null, participants: [], currentUser: null, currentQuestion: null, votes: [], isSeniorMode: false }),
}));
