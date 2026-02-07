
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useGameStore } from '@/store/gameStore';
import JoinForm from '@/components/room/JoinForm';
import LobbyView from '@/components/room/LobbyView';
import VotingView from '@/components/room/VotingView';
import ResultView from '@/components/room/ResultView';
import { Loader2 } from 'lucide-react';

export default function RoomPage() {
    const { code } = useParams();
    const {
        room, setRoom,
        participants, setParticipants,
        currentUser, setCurrentUser,
        currentQuestion, setCurrentQuestion,
        votes, setVotes
    } = useGameStore();

    const [isLoading, setIsLoading] = useState(true);

    // 1. Initial Data Fetch
    useEffect(() => {
        const fetchRoomData = async () => {
            if (!code) return;

            try {
                // Fetch Room
                const roomCode = Array.isArray(code) ? code[0] : code;
                const { data: roomData, error: roomError } = await supabase
                    .from('rooms')
                    .select('*')
                    .eq('code', roomCode)
                    .single();

                if (roomError || !roomData) {
                    alert('존재하지 않는 방입니다.');
                    window.location.href = '/';
                    return;
                }

                setRoom(roomData);

                // Fetch Participants
                const { data: partData } = await supabase
                    .from('participants')
                    .select('*')
                    .eq('room_id', roomData.id);

                if (partData) setParticipants(partData);

                // Check LocalStorage for User
                const localUser = localStorage.getItem(`moyora_user_${roomData.id}`);
                if (localUser) {
                    const user = JSON.parse(localUser);
                    // Verify user still exists in DB? (Optional but good)
                    setCurrentUser(user);
                }

            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoomData();
    }, [code, setRoom, setParticipants, setCurrentUser]);

    // 2. Realtime Subscriptions
    useEffect(() => {
        if (!room?.id) return;

        const channel = supabase
            .channel(`room_${room.id}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${room.id}` },
                (payload) => {
                    setRoom(payload.new as any);
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'participants', filter: `room_id=eq.${room.id}` },
                async () => {
                    // Re-fetch to ensure fresh list
                    const { data } = await supabase.from('participants').select('*').eq('room_id', room.id);
                    if (data) setParticipants(data);
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'votes', filter: `room_id=eq.${room.id}` },
                (payload) => {
                    // Access current state directly to avoid dependency issues
                    const currentVotes = useGameStore.getState().votes;
                    setVotes([...currentVotes, payload.new]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [room?.id]); // Re-sub if room.id changes (it shouldn't)

    // 3. Sync Logic (Participants & Question)
    // Subscription handles updates. 
    // This effect is reserved for other sync needs if any.

    // Effect: Fetch Question from LOCAL JSON
    useEffect(() => {
        const fetchQuestion = async () => {
            if (room?.current_question_id) {
                // Look up game in LOCAL Data
                // Dynamic import to avoid cycles if needed, but standard import is fine
                const { findGameById } = await import('@/utils/gameLookup');
                const localGame = findGameById(room.current_question_id);

                if (localGame) {
                    setCurrentQuestion({
                        id: localGame.id || room.current_question_id, // Ensure ID exists
                        category: localGame.category,
                        type: localGame.type,
                        content: localGame.question,
                        options: localGame.options || null, // Handle undefined
                        timer: localGame.timer,
                        created_at: new Date().toISOString() // Mock
                    });
                } else {
                    console.warn(`Game not found in local pack: ${room.current_question_id}`);
                    // RECOVERY LOGIC for Stale IDs
                    if (currentUser?.is_host && room.status !== 'waiting') {
                        console.warn("Attempting auto-skip of stale game due to ID mismatch...");
                        import('@/store/turnStore').then(({ useTurnStore }) => {
                            useTurnStore.getState().playNextGame(room.id);
                        });
                    }
                }

                // Still fetch votes from DB (Votes are user data, not static)
                const { data: vData } = await supabase
                    .from('votes')
                    .select('*')
                    .eq('room_id', room.id)
                    .eq('question_id', room.current_question_id);
                if (vData) setVotes(vData);

            } else {
                setCurrentQuestion(null);
                setVotes([]);
            }
        };
        fetchQuestion();
    }, [room?.current_question_id]);


    // Loading Wrapper
    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;

    // Render Logic
    if (!currentUser) {
        return <JoinForm roomId={room!.id} onJoin={setCurrentUser} />;
    }

    // Game Logic
    if (room?.status === 'waiting') {
        return <LobbyView />;
    }

    if (room?.status === 'playing') {
        return <VotingView votes={votes} />;
    }

    if (room?.status === 'result') {
        return <ResultView votes={votes} />;
    }

    return <div>Unknown Status</div>;
}
