
'use client';

import { useGameStore } from '@/store/gameStore';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Play, Download, Share2, Crown, Trophy } from 'lucide-react';

interface ResultViewProps {
    votes: any[];
}

export default function ResultView({ votes }: ResultViewProps) {
    const { room, participants, currentUser, currentQuestion } = useGameStore();
    const [isNextLoading, setIsNextLoading] = useState(false);

    // Parse options
    let options: string[] = [];
    if (currentQuestion?.options && typeof currentQuestion.options === 'string') {
        try { options = JSON.parse(currentQuestion.options); } catch (e) { }
    } else if (Array.isArray(currentQuestion?.options)) {
        options = currentQuestion.options as string[];
    }

    // Aggregate votes
    const results = useMemo(() => {
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
    }, [votes, participants, options]);

    const winner = results[0];

    useEffect(() => {
        // Fire confetti on mount
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
    }, []);

    const handleNext = async () => {
        if (!room) return;
        setIsNextLoading(true);

        try {
            // 1. Get latest room data for used_question_ids (to be safe)
            const { data: latestRoom } = await supabase.from('rooms').select('used_question_ids').eq('id', room.id).single();
            const usedIds = (latestRoom as any)?.used_question_ids || [];

            // Add current to used
            if (room.current_question_id) usedIds.push(room.current_question_id);

            // 2. Fetch questions excluding used
            // Supabase `.not` with `in` is tricky with empty array.
            let query = supabase.from('questions').select('id').eq('category', room.category);

            if (usedIds.length > 0) {
                // Must convert array to tuple string for PostgREST: (id1,id2)
                // Actually .not('id', 'in', `(${usedIds.join(',')})`)
                query = query.not('id', 'in', `(${usedIds.join(',')})`);
            }

            const { data: questions } = await query;

            if (!questions || questions.length === 0) {
                // Reset used questions if all used? Or Game Over?
                // Let's reset for infinite play but show alert.
                const confirmReset = confirm('모든 질문을 다 풀었어요! 처음부터 다시 할까요?');
                if (confirmReset) {
                    await supabase.from('rooms').update({ used_question_ids: [] } as any).eq('id', room.id);
                    handleNext(); // Retry
                    return;
                }
                setIsNextLoading(false);
                return;
            }

            const randomQ = questions[Math.floor(Math.random() * questions.length)];

            // 3. Update Room
            await supabase
                .from('rooms')
                .update({
                    status: 'playing',
                    current_question_id: randomQ.id,
                    used_question_ids: [...usedIds, randomQ.id] // Optimistic update
                } as any)
                .eq('id', room.id);

            // Clean up previous votes? 
            // Ideally we should keep history but for current Logic `VotingView` filters by `question_id`.
            // So old votes in `votes` table are fine.
            // But `page.tsx`'s `votes` state accumulates ALL votes from subscription.
            // We need to clear `votes` state in `page.tsx` when question changes. 
            // Handled in page.tsx: "Fetch votes for THIS question" -> sets state. 
            // But subscription APPNEDS. 
            // So if I am in ResultView, and Next is clicked -> Room updates -> Page Re-renders -> Effect runs -> Fetches emptiness -> SetVotes([]).
            // Looks correct.

        } catch (e) {
            console.error(e);
            setIsNextLoading(false);
        }
    };

    const handleShare = async () => {
        const title = '모여라 투표 결과';
        const text = `Q. ${currentQuestion?.content}\n\n🏆 1등: ${winner?.label} (${winner?.count}표)`;

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
            <div className="flex-1 flex flex-col justify-center items-center px-6 py-8 gap-y-12 relative z-10 min-h-0">

                {/* Winner Spotlight Block */}
                <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary blur-2xl opacity-60 animate-pulse-slow rounded-full"></div>

                        {/* Crown */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce-slow">
                            <Crown className="w-12 h-12 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
                        </div>

                        <div className="w-40 h-40 bg-white rounded-[2.5rem] flex items-center justify-center text-[3.5rem] font-black text-gray-900 shadow-2xl relative z-10 border-[6px] border-white/20">
                            {winner?.avatar}
                        </div>

                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-full font-black text-xl shadow-lg whitespace-nowrap z-20 border-2 border-white/20">
                            {winner?.label}
                        </div>
                    </div>

                    <p className="text-white/80 font-bold text-lg mt-8 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        총 <span className="text-yellow-400 text-2xl">{winner?.count}</span>표 획득!
                    </p>
                </div>

                {/* Others List Block */}
                <div className="flex-shrink-0 w-full max-w-sm space-y-3">
                    {results.slice(1).map((res, idx) => (
                        <div key={res.targetId || idx} className="flex items-center justify-between bg-white/5 border border-white/10 px-5 py-4 rounded-2xl backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <span className="text-white/40 font-mono text-sm font-bold w-6">#{idx + 2}</span>
                                <span className="font-bold text-lg">{res.label}</span>
                            </div>
                            <span className="font-bold text-white/60">{res.count}표</span>
                        </div>
                    ))}
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
                            className="flex-1 py-3 bg-white/10 border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition backdrop-blur-sm text-sm"
                        >
                            <Download className="w-4 h-4" /> 이미지 저장
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex-1 py-3 bg-secondary rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 transition text-white text-sm shadow-lg shadow-secondary/20"
                        >
                            <Share2 className="w-4 h-4" /> 결과 공유
                        </button>
                    </div>

                    {currentUser?.is_host && (
                        <button
                            onClick={handleNext}
                            disabled={isNextLoading}
                            className="w-full py-4 bg-white text-gray-900 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
                        >
                            {isNextLoading ? '로딩 중...' : '다음 질문 (Next)'} <Play className="w-6 h-6 fill-current" />
                        </button>
                    )}
                </div>
            </div>

        </div>
    );
}
