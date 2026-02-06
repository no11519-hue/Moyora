
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
        currentQuestion, setCurrentQuestion
    } = useGameStore();

    const [isLoading, setIsLoading] = useState(true);
    const [votes, setVotes] = useState<any[]>([]);

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
                    setVotes(prev => [...prev, payload.new]);
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


    // Effect: Fetch Question when `room.current_question_id` changes
    useEffect(() => {
        const fetchQuestion = async () => {
            if (room?.current_question_id) {
                const { data } = await supabase
                    .from('questions')
                    .select('id, category, type, content, options, timer, created_at')
                    .eq('id', room.current_question_id)
                    .single();

                if (data) {
                    // Category Whitelist & Mapping
                    let safeCategory = data.category;
                    const allowed = new Set(["icebreaking", "dating", "drinking", "workshop", "crewmode"]);
                    if (!allowed.has(safeCategory)) {
                        console.warn(`Unknown category '${safeCategory}', mapping to 'workshop'`);
                        safeCategory = 'workshop';
                    }

                    // Safe Object Construction
                    setCurrentQuestion({
                        id: data.id,
                        category: safeCategory,
                        type: data.type,
                        content: data.content,
                        options: data.options,
                        timer: data.timer,
                        created_at: data.created_at
                    });
                } else {
                    setCurrentQuestion(null);
                }

                // Also fetch votes for this question
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
