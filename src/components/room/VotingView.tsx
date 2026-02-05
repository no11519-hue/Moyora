
'use client';

import { useGameStore } from '@/store/gameStore';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { Loader2, Zap, Timer, Check, Info } from 'lucide-react';

interface VotingViewProps {
    votes: any[];
}

export default function VotingView({ votes }: VotingViewProps) {
    const { room, participants, currentUser, currentQuestion } = useGameStore();
    const [isVoting, setIsVoting] = useState(false);

    // Timer for non-voting types or visual aid
    const [timeLeft, setTimeLeft] = useState(currentQuestion?.timer || 30);

    useEffect(() => {
        if (!currentQuestion?.timer) return;
        setTimeLeft(currentQuestion.timer);
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [currentQuestion]);


    // Check if I voted
    const myVote = votes.find(v => v.voter_id === currentUser?.id && v.question_id === room?.current_question_id);
    const totalVotes = votes.length;
    const totalParticipants = participants.length;

    const handleVote = async (targetId: string) => {
        if (isVoting || myVote || !room || !currentQuestion || !currentUser) return;
        setIsVoting(true);

        try {
            await supabase.from('votes').insert({
                room_id: room.id,
                question_id: currentQuestion.id,
                voter_id: currentUser.id,
                target_id: targetId,
            });
        } catch (e) {
            console.error(e);
            alert('투표 실패');
            setIsVoting(false);
        }
    };

    const handleShowResult = async () => {
        if (!room) return;
        await supabase.from('rooms').update({ status: 'result' }).eq('id', room.id);
    };

    // Parse options for Balance Game
    let options: string[] = [];
    if (currentQuestion?.options && typeof currentQuestion.options === 'string') {
        try { options = JSON.parse(currentQuestion.options); } catch (e) { }
    } else if (Array.isArray(currentQuestion?.options)) {
        options = currentQuestion.options as string[];
    }

    const isVoteType = currentQuestion?.type?.startsWith('vote_');
    const isBalanceType = currentQuestion?.type?.startsWith('balance_');
    const isMissionType = currentQuestion?.type?.startsWith('mission_') || currentQuestion?.type?.startsWith('talk_') || currentQuestion?.type?.startsWith('roulette_');

    if (!currentQuestion) return <div className="p-10 text-center flex flex-col items-center gap-4"><Loader2 className="animate-spin text-primary w-8 h-8" /><span>문제 출제 중...</span></div>;

    return (
        <div className="flex flex-col min-h-screen bg-[#FDFBF7] pb-32 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>

            {/* Question Card */}
            <div className="sticky top-0 z-20 px-4 pt-6 pb-2">
                <div className="bg-white rounded-[2rem] shadow-soft p-6 text-center border-2 border-primary/10 relative overflow-hidden animate-slide-up">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary"></div>

                    <div className="flex justify-between items-start mb-2">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-primary tracking-widest uppercase bg-primary/10 px-2 py-1 rounded-full">
                            <Zap className="w-3 h-3 fill-primary" /> Q. {currentQuestion.type?.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        {currentQuestion.timer && (
                            <span className={`flex items-center gap-1 font-mono font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                                <Timer className="w-4 h-4" /> {timeLeft}s
                            </span>
                        )}
                    </div>

                    <h2 className="text-[22px] font-black text-gray-900 leading-[1.3] text-balance break-keep my-2">
                        {currentQuestion.content}
                    </h2>
                </div>
            </div>

            {/* --- UI Branching based on Type --- */}
            <div className="flex-1 px-4 py-4 overflow-y-auto">

                {/* 1. People Voting */}
                {isVoteType && (
                    !myVote ? (
                        <div className="grid grid-cols-2 gap-3 pb-20 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            {participants.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => handleVote(p.id)}
                                    disabled={isVoting}
                                    className="group relative bg-white p-4 rounded-3xl border-2 border-gray-100 flex flex-col items-center gap-2 active:scale-95 transition-all shadow-card hover:shadow-card-hover hover:border-primary/50"
                                >
                                    <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-white rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                                        {p.nickname[0]}
                                    </div>
                                    <span className="font-bold text-gray-800 text-base truncate w-full text-center group-hover:text-primary transition-colors">
                                        {p.nickname}
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <VotedState />
                    )
                )}

                {/* 2. Balance Game */}
                {isBalanceType && (
                    !myVote ? (
                        <div className="flex flex-col gap-4 mt-4 animate-slide-up">
                            {options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleVote(idx === 0 ? 'A' : 'B')} // Temp: Use 'A'/'B' as target_id for balance
                                    disabled={isVoting}
                                    className={`w-full py-8 rounded-3xl text-xl font-black border-4 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all active:scale-95
                                ${idx === 0 ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-red-50 border-red-200 text-red-600'}
                            `}
                                >
                                    {idx === 0 ? '🅰️' : '🅱️'} {opt}
                                </button>
                            ))}
                            <p className="text-center text-gray-400 text-sm font-bold mt-4">하나만 선택하세요!</p>
                        </div>
                    ) : (
                        <VotedState />
                    )
                )}

                {/* 3. Mission / Talk */}
                {isMissionType && (
                    <div className="flex flex-col items-center justify-center h-[40vh] text-center animate-slide-up bg-white rounded-[2rem] border-2 border-dashed border-gray-300 p-8 shadow-sm">
                        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center text-4xl mb-4 animate-bounce-slow">
                            🗣️
                        </div>
                        <p className="text-gray-600 font-bold mb-2">대화/미션 주제입니다.</p>
                        <p className="text-gray-400 text-sm">타이머가 끝나면 다음으로 넘어가세요!</p>
                    </div>
                )}

            </div>

            {/* Progress Footer */}
            {(isVoteType || isBalanceType) && (
                <div className="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 p-6 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-30">
                    <div className="flex justify-between items-end mb-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vote Progress</span>
                        <span className="text-xl font-black text-secondary">{totalVotes} <span className="text-sm text-gray-400 font-medium">/ {totalParticipants}</span></span>
                    </div>
                    <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700 ease-out relative"
                            style={{ width: `${(totalVotes / totalParticipants) * 100}%` }}
                        >
                            <div className="absolute top-0 left-0 w-full h-full bg-white/30 animate-pulse-fast"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Host Control for Mission Type or Vote Result */}
            {currentUser?.is_host && (
                <div className="fixed bottom-6 left-0 w-full px-6 z-40">
                    {(isMissionType || totalVotes > 0) && (
                        <button
                            onClick={handleShowResult}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {isMissionType ? '다음으로 넘어가기' : '결과 공개하기'} <Zap className="w-5 h-5 fill-current text-yellow-400" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function VotedState() {
    return (
        <div className="flex flex-col items-center justify-center h-[30vh] text-center animate-pulse-fast mt-10">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-glow text-green-600">
                <Check className="w-10 h-10" strokeWidth={3} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-1">참여 완료!</h3>
            <p className="text-gray-400 font-medium text-sm">다른 친구들을 기다리고 있어요.</p>
        </div>
    )
}
