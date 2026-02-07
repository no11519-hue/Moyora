
'use client';

import { useGameStore } from '@/store/gameStore';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Play, Download, Share2, Crown, Trophy } from 'lucide-react';
import { useTurnStore } from '@/store/turnStore';
import { Database } from '@/types/database.types';

type Vote = Database['public']['Tables']['votes']['Row'];

interface RoomMessage {
    id: string;
    room_id: string;
    nickname: string;
    message: string;
    created_at: string;
}

interface GameAction {
    id: string;
    room_id: string;
    question_id: string;
    voter_id: string;
    target_value: string;
    action_type: string;
    created_at: string;
}

interface ResultViewProps {
    votes: Vote[];
}

export default function ResultView({ votes }: ResultViewProps) {
    const { room, participants, currentUser, currentQuestion } = useGameStore();
    const [isNextLoading, setIsNextLoading] = useState(false);
    const [missionMessages, setMissionMessages] = useState<RoomMessage[]>([]);

    const isMissionType = currentQuestion?.type?.startsWith('mission_') ||
        currentQuestion?.type?.startsWith('talk_') ||
        currentQuestion?.type === 'Q';

    const isFreeVoteType = ['vote_image', 'vote_praise'].includes(currentQuestion?.type || '');
    const [freeVotes, setFreeVotes] = useState<GameAction[]>([]);

    // Fetch Messages for Mission Type
    useEffect(() => {
        if (isMissionType && room?.id && currentQuestion?.id) {
            supabase.from('room_messages' as any)
                .select('*')
                .eq('room_id', room.id)
                .eq('question_id', currentQuestion.id)
                .order('created_at', { ascending: true })
                .then(({ data }) => {
                    if (data) setMissionMessages(data as unknown as RoomMessage[]);
                });
        }
    }, [isMissionType, room?.id, currentQuestion?.id]);

    // Fetch Free Votes for Free Vote Type (Existing)
    useEffect(() => {
        if (isFreeVoteType && room?.id && currentQuestion?.id) {
            supabase.from('game_actions' as any)
                .select('*')
                .eq('room_id', room.id)
                .eq('question_id', currentQuestion.id)
                .then(({ data }) => {
                    if (data) setFreeVotes(data as unknown as GameAction[]);
                });
        }
    }, [isFreeVoteType, room?.id, currentQuestion?.id]);

    // NEW: Fetch Standard Votes ensures we have latest data even if Subscription missed
    // This solves "Results not showing" if realtime is flaky
    const { setVotes: setStoreVotes } = useGameStore();
    useEffect(() => {
        if (!isFreeVoteType && room?.id && currentQuestion?.id) {
            supabase.from('votes')
                .select('*')
                .eq('room_id', room.id)
                .eq('question_id', currentQuestion.id)
                .then(({ data }) => {
                    if (data) setStoreVotes(data);
                });
        }
    }, [isFreeVoteType, room?.id, currentQuestion?.id, setStoreVotes]);


    // Parse options
    let options: string[] = [];
    if (currentQuestion?.options && typeof currentQuestion.options === 'string') {
        try { options = JSON.parse(currentQuestion.options); } catch (e) { }
    } else if (Array.isArray(currentQuestion?.options)) {
        options = currentQuestion.options as string[];
    }

    // Aggregate votes (Standard)
    const results = useMemo(() => {
        if (isFreeVoteType) return [];
        const counts: Record<string, number> = {};
        votes.forEach(v => {
            counts[v.target_id] = (counts[v.target_id] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([targetId, count]) => {
                const participant = participants.find(p => p.id === targetId);
                let label = participant?.nickname || targetId;
                let avatar = participant?.nickname?.[0]; // Default avatar char

                // Handle Balance Game (A/B)
                if (!participant) {
                    if (targetId === 'A' && options[0]) {
                        label = options[0];
                        avatar = '🅰️';
                    } else if (targetId === 'B' && options[1]) {
                        label = options[1];
                        avatar = '🅱️';
                    }
                }

                return { participant, label, avatar, count, targetId };
            })
            .sort((a, b) => b.count - a.count);
    }, [votes, participants, options, isFreeVoteType]);

    // Aggregate Free Votes
    const freeVoteResults = useMemo(() => {
        if (!isFreeVoteType) return [];
        const counts: Record<string, number> = {};
        freeVotes.forEach(vote => {
            const name = vote.target_value || 'Unknown';
            counts[name] = (counts[name] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [freeVotes, isFreeVoteType]);


    // Detect tie/draw (동점 감지)
    const isTie = !isFreeVoteType && results.length >= 2 && results[0].count === results[1].count;
    const winner = !isFreeVoteType && !isTie ? results[0] : null;

    useEffect(() => {
        // Fire confetti only if not a tie (and handled for free votes separately if needed, but keeping existing logic for now)
        if (isTie) return;
        if (isFreeVoteType && freeVoteResults.length > 0) return; // Maybe handle confetti for free votes too?

        const duration = 3000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#FF6B6B', '#FF9F43', '#ffffff']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#FF6B6B', '#FF9F43', '#ffffff']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        })();
    }, [isTie, isFreeVoteType, freeVoteResults.length]);

    const { playNextGame, fetchTurn } = useTurnStore();

    // Type definition moved to top for Hook dependency

    const handleNext = async () => {
        if (!room) return;
        setIsNextLoading(true);

        try {
            // Try to play next game from queue
            let success = await playNextGame(room.id);

            if (!success) {
                // Queue exhausted or empty?
                // Auto-generate NEW TURN (Round 1~3 again)
                // User requirement: "3 rounds ended -> Declare Turn End -> Ready for Next Turn"
                // Ideally we show a 'Turn End' summary, but here we just auto-start new turn for seamless play.

                await fetchTurn(room.category, participants.length); // Fetch new 12 games
                success = await playNextGame(room.id);

                if (!success) {
                    alert('새로운 턴을 시작할 수 없습니다. (DB 오류 등)');
                }
            }
        } catch (e) {
            console.error(e);
            alert('오류가 발생했습니다.');
        } finally {
            setIsNextLoading(false);
        }
    };

    const handleShare = async () => {
        const title = '모여라 투표 결과';
        const text = `Q. ${currentQuestion?.content}\n\n🏆 1등: ${winner?.label || freeVoteResults[0]?.name} (${winner?.count || freeVoteResults[0]?.count}표)`;

        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url: window.location.href,
                });
            } catch (e) {
                console.log('Share canceled');
            }
        } else {
            alert('결과 텍스트가 복사되었습니다!');
            navigator.clipboard.writeText(`${text}\n${window.location.href}`);
        }
    };

    return (
        <div className="flex flex-col min-h-[100dvh] bg-gray-900 text-white relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[-20%] w-80 h-80 bg-primary/30 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-80 h-80 bg-secondary/30 rounded-full blur-[100px] pointer-events-none"></div>

            {/* ZONE 1: Header - Question Text (Fixed Top) */}
            <div className="flex-shrink-0 pt-safe-top px-6 pt-6 pb-4 text-center relative z-20">
                <h3 className="text-white/50 text-xs font-bold mb-3 uppercase tracking-widest border border-white/10 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
                    Vote Result
                </h3>
                <h2 className="text-lg font-bold text-balance leading-snug drop-shadow-md max-w-md mx-auto">
                    {currentQuestion?.content}
                </h2>
            </div>

            {/* ZONE 2: Main Body - Winner Display (Flex-1, Centered with Strong Gaps) */}
            {/* ZONE 2: Main Body - Winner Display (Flex-1, Centered with Strong Gaps) */}
            {/* Added pb-48 for safe scroll area above fixed footer */}
            <div className="flex-1 flex flex-col items-center px-6 pt-16 pb-64 gap-y-12 relative z-10 min-h-0 overflow-y-auto w-full">

                {isMissionType ? (
                    <div className="flex-1 flex flex-col items-center w-full max-w-md animate-slide-up">
                        <div className="text-center mb-8">
                            <h3 className="text-3xl font-black mb-2 drop-shadow-md">답변 결과</h3>
                            <p className="text-white/60 text-lg">참여자들의 생각입니다</p>
                        </div>

                        <div className="w-full flex flex-col gap-3 pb-8">
                            {missionMessages.length > 0 ? (
                                missionMessages.map((msg, idx) => (
                                    <div key={idx} className="bg-white/10 border border-white/20 p-5 rounded-2xl backdrop-blur-md flex flex-col gap-1 shadow-lg">
                                        <span className="font-bold text-yellow-400 text-sm">{msg.nickname}</span>
                                        <span className="text-white text-lg font-medium break-words leading-relaxed">
                                            {msg.message}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-white/40 text-center py-10">
                                    등록된 답변이 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                ) : isFreeVoteType ? (
                    /* Free Vote Result - Ranking List */
                    <div className="w-full max-w-md flex flex-col gap-3 animate-slide-up">
                        {freeVoteResults.length > 0 ? (
                            freeVoteResults.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-lg shadow mb-2 text-gray-900">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-100 text-gray-500'}`}>
                                            {idx + 1}
                                        </div>
                                        <span className="text-lg font-bold">{item.name}</span>
                                    </div>
                                    <span className="text-indigo-600 font-bold">{item.count}표</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-white/40 text-center py-10">
                                아직 등록된 답변이 없습니다.
                            </div>
                        )}
                    </div>
                ) : isTie ? (
                    /* TIE/DRAW Display */
                    <div className="flex-shrink-0 flex flex-col items-center gap-6">
                        {/* Handshake Icon */}
                        <div className="text-8xl animate-bounce-slow">🤝</div>

                        {/* Tie Message */}
                        <div className="text-center">
                            <h3 className="text-3xl font-black mb-2">막상막하!</h3>
                            <p className="text-white/60 text-lg">동점이에요 (각 {results[0].count}표)</p>
                        </div>

                        {/* Tied Options */}
                        <div className="flex gap-4 mt-4">
                            {results.filter(r => r.count === results[0].count).map((res, idx) => (
                                <div key={res.targetId} className="flex flex-col items-center gap-2 bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-md">
                                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-4xl font-black text-gray-900 shadow-xl">
                                        {res.avatar}
                                    </div>
                                    <span className="font-bold text-base text-center break-keep">{res.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Winner Spotlight Block - Refactored to Flex Stack */
                    <div className="flex-shrink-0 flex flex-col items-center gap-2 animate-slide-up">
                        {/* 1. Crown */}
                        <Crown className="w-10 h-10 text-yellow-400 fill-yellow-400 drop-shadow-lg mb-1 animate-bounce-slow" />

                        {/* 2. Avatar Box */}
                        <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center text-[3rem] font-black text-gray-900 shadow-xl border-4 border-white/20">
                            {winner?.avatar}
                        </div>

                        {/* 3. Badge (Name) */}
                        <div className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-xl font-bold text-lg shadow-md break-keep text-center mt-2 border border-white/20">
                            {winner?.label || '익명'}
                        </div>

                        {/* 4. Count */}
                        <div className="flex items-center gap-2 text-white/80 font-bold text-base mt-1">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                            총 <span className="text-yellow-400 text-xl">{winner?.count}</span>표
                        </div>
                    </div>
                )}

                {/* Others List Block */}
                <div className="flex-shrink-0 w-full max-w-sm space-y-3">
                    {results.slice(1).map((res, idx) => {
                        const totalVotes = results.reduce((acc, curr) => acc + curr.count, 0);
                        const percentage = Math.round((res.count / totalVotes) * 100);

                        return (
                            <div key={res.targetId || idx} className="relative w-full h-14 bg-white/10 rounded-full overflow-hidden border border-white/5">
                                {/* Progress Bar Fill */}
                                <div
                                    className="absolute top-0 left-0 h-full bg-secondary/80 transition-all duration-1000 ease-out"
                                    style={{ width: `${percentage}%` }}
                                />

                                {/* Content Overlay */}
                                <div className="absolute inset-0 flex items-center justify-between px-6">
                                    <div className="flex items-center gap-3 relative z-10">
                                        <span className="text-white/50 font-mono text-sm font-bold">#{idx + 2}</span>
                                        <span className="font-bold text-lg text-shadow-sm truncate max-w-[140px]">{res.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2 relative z-10">
                                        <span className="font-bold text-xl">{res.count}표</span>
                                        <span className="text-xs font-medium text-white/50">({percentage}%)</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {results.length === 1 && (
                        <div className="text-white/30 text-sm py-4">
                            만장일치거나 혼자 투표했군요! 😮
                        </div>
                    )}
                </div>
            </div>

            {/* ZONE 3: Footer - Controls (Fixed Bottom) */}
            <div className="flex-shrink-0 fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent z-30 pb-[calc(16px+env(safe-area-inset-bottom))]">
                <div className="max-w-lg mx-auto flex flex-col gap-3">
                    <div className="flex gap-3">
                        <button
                            onClick={() => alert('이미지 저장 기능은 준비중입니다!')}
                            className="flex-1 h-14 bg-white/10 border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/20 active:scale-95 transition backdrop-blur-sm text-base"
                        >
                            <Download className="w-5 h-5" /> 이미지 저장
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex-1 h-14 bg-secondary rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 active:scale-95 transition text-white text-base shadow-lg shadow-secondary/20"
                        >
                            <Share2 className="w-5 h-5" /> 결과 공유
                        </button>
                    </div>

                    {currentUser?.is_host && (
                        <button
                            onClick={handleNext}
                            disabled={isNextLoading}
                            className="w-full h-16 bg-white text-gray-900 rounded-2xl font-black text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
                        >
                            {isNextLoading ? '로딩 중...' : '다음 질문 (Next) ▶'} <Play className="w-6 h-6 fill-current" />
                        </button>
                    )}
                </div>
            </div>

        </div>
    );
}
