
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

    setRoom: (room: Room) => void;
    setParticipants: (participants: Participant[]) => void;
    setCurrentUser: (user: Participant) => void;
    setCurrentQuestion: (question: Question | null) => void;
    reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
    room: null,
    participants: [],
    currentUser: null,
    currentQuestion: null,

    setRoom: (room) => set({ room }),
    setParticipants: (participants) => set({ participants }),
    setCurrentUser: (currentUser) => set({ currentUser }),
    setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),
    reset: () => set({ room: null, participants: [], currentUser: null, currentQuestion: null }),
}));
