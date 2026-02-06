
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
    const isRouletteType = currentQuestion?.type?.startsWith('roulette_');
    const isMissionType = !isRouletteType && (currentQuestion?.type?.startsWith('mission_') || currentQuestion?.type?.startsWith('talk_'));

    if (!currentQuestion) return <div className="p-10 text-center flex flex-col items-center gap-4"><Loader2 className="animate-spin text-primary w-8 h-8" /><span>문제 출제 중...</span></div>;

    return (
        <div className="flex flex-col min-h-[100dvh] bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-[100px] relative overflow-hidden">

            {/* 1. Header & Progress Timer */}
            <div className="pt-safe-top sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-gray-100/50">
                {currentQuestion.timer && (
                    <div className="h-1.5 w-full bg-gray-100 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-linear will-change-transform"
                            style={{ width: `${(timeLeft / currentQuestion.timer) * 100}%` }}
                        />
                    </div>
                )}
                <div className="px-4 py-3 flex justify-between items-center relative">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-primary tracking-widest uppercase bg-primary/10 px-2.5 py-1 rounded-full">
                        {currentQuestion.type?.replace(/_/g, ' ').toUpperCase()}
                    </span>

                    {currentQuestion.timer && (
                        <span className={`font-mono font-bold text-lg ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-900'}`}>
                            {timeLeft}
                        </span>
                    )}
                </div>
            </div>

            {/* 2. Main Question Card (Centered) */}
            <div className="flex-1 flex flex-col justify-center px-6 py-4 w-full max-w-lg mx-auto">
                <div
                    key={currentQuestion.id} // Trigger animation on change
                    className="animate-slide-in-right //custom-animation-class-needed-or-standard
                               flex flex-col justify-center items-center text-center
                               bg-white rounded-[2.5rem] p-8 shadow-card-lg border border-gray-100/80
                               min-h-[320px] relative overflow-hidden group
                    "
                >
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary" />
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

                    {/* Question Content */}
                    <div className="mb-2">
                        <div className="w-10 h-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-xl mb-4 text-primary">
                            Q
                        </div>
                    </div>

                    <h2 className="text-[28px] sm:text-[32px] font-black text-gray-900 leading-[1.35] tracking-tight break-keep text-balance drop-shadow-sm">
                        {currentQuestion.content}
                    </h2>

                    {/* Instruction Hint */}
                    <p className="mt-6 text-sm font-medium text-gray-400 animate-pulse">
                        {isVoteType ? '투표할 대상을 선택하세요' : isBalanceType ? '하나를 선택하세요' : '자유롭게 이야기해보세요'}
                    </p>
                </div>

                {/* --- UI Branching based on Type (Voting Options) --- */}
                {/* Voting Options move below or inside depending on design. User asked for card to be centered. Options should follow. */}
                {/* IF it's a voting/balance game, we put options BELOW the main card or Integrated? */}
                {/* Let's put them below, but with less margin so they feel connected. */}

                <div className="mt-6 w-full animate-fade-in-up delay-100">
                    {/* 1. People Voting */}
                    {isVoteType && (
                        !myVote ? (
                            <div className="grid grid-cols-2 gap-3">
                                {participants.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => handleVote(p.id)}
                                        disabled={isVoting}
                                        className="relative bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-3 active:scale-98 transition-all shadow-sm hover:shadow-md hover:border-primary/30 text-left"
                                    >
                                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-lg shrink-0">
                                            {p.nickname[0]}
                                        </div>
                                        <span className="font-bold text-gray-900 text-sm truncate">
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
                            <div className="flex flex-col gap-3">
                                {options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleVote(idx === 0 ? 'A' : 'B')}
                                        disabled={isVoting}
                                        className={`w-full py-5 rounded-2xl text-lg font-bold border-2 shadow-sm active:scale-98 transition-all flex items-center justify-between px-6
                                    ${idx === 0 ? 'bg-blue-50/50 border-blue-100 text-blue-700 hover:bg-blue-50' : 'bg-red-50/50 border-red-100 text-red-700 hover:bg-red-50'}
                                `}
                                    >
                                        <span className="text-2xl">{idx === 0 ? '🅰️' : '🅱️'}</span>
                                        <span>{opt}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <VotedState />
                        )
                    )}

                    {/* 4. Roulette Game (Inline) */}
                    {isRouletteType && (
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col items-center">
                            {currentUser?.is_host ? (
                                <RouletteGame participants={participants} onComplete={async (winnerId) => {
                                    await handleVote(winnerId);
                                    setTimeout(() => handleShowResult(), 1000);
                                }} />
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-6xl mb-4 animate-spin-slow inline-block">🎡</div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-1">룰렛 돌아가는 중...</h3>
                                    <p className="text-gray-400 text-sm">누가 당첨될까요?</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Bottom Control Bar (Sticky) */}
            {/* Host Only Button */}
            {currentUser?.is_host && (isMissionType || totalVotes > 0) && (
                <div className="fixed bottom-0 left-0 z-50 w-full p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 pb-[calc(16px+env(safe-area-inset-bottom))]">
                    <button
                        onClick={handleShowResult}
                        className="w-full h-[56px] bg-[#111827] text-white rounded-xl font-bold text-lg shadow-lg hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 max-w-lg mx-auto"
                    >
                        {isMissionType ? '다음으로 넘어가기' : '결과 공개하기'}
                    </button>
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

function RouletteGame({ participants, onComplete }: { participants: any[], onComplete: (winnerId: string) => void }) {
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);

    const sliceAngle = 360 / participants.length;

    const handleSpin = () => {
        if (isSpinning) return;
        setIsSpinning(true);

        // 랜덤 회전: 최소 5바퀴(1800도) + 랜덤 각도
        // 당첨자 계산을 위해, 특정 각도에 멈추게 하려면 역산이 필요하지만,
        // 여기서는 그냥 랜덤으로 돌리고 멈춘 위치의 사람을 계산함.
        // CSS rotate는 시계방향. 0도(12시) 기준.
        // 12시 방향에 있는 조각이 당첨.

        const randomDegree = Math.floor(Math.random() * 360);
        const targetRotation = rotation + 1800 + (360 - randomDegree); // 360 - random 은 보정값
        // 실제로는 그냥 full random 돌리고 계산하는게 편함.

        const finalRotation = rotation + 1800 + Math.random() * 360;
        setRotation(finalRotation);

        setTimeout(() => {
            setIsSpinning(false);

            // 당첨자 계산
            // rotation % 360.
            // 0도가 12시. Slice는 0도부터 시계방향으로 배치된다고 가정?
            // CSS rotate transform 기준.
            // 위쪽(12시) 화살표에 닿는 녀석을 구해야 함.
            // 회전된 각도(finalRotation)를 360으로 나눈 나머지.
            const actualDeg = finalRotation % 360;

            // 바늘은 12시에 고정.
            // 원판이 시계방향으로 돌면, 바늘에 닿는 인덱스는 역순으로 변함.
            // Index = floor( (360 - actualDeg) / sliceAngle ) % N

            const winningIndex = Math.floor(((360 - (actualDeg % 360)) % 360) / sliceAngle);
            const winner = participants[winningIndex];

            if (winner) {
                // 알림 및 완료 처리
                // alert(`당첨: ${winner.nickname}`);
                onComplete(winner.id);
            }
        }, 3500); // 3.5s duration
    };

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#F1948A'];

    return (
        <div className="flex flex-col items-center gap-6 py-4">
            <div className="relative w-72 h-72">
                {/* Pointer (Triangle) */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-8 h-8">
                    <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-gray-800 drop-shadow-md"></div>
                </div>

                {/* Wheel */}
                <div
                    className="w-full h-full rounded-full border-4 border-white shadow-2xl overflow-hidden relative transition-transform cubic-bezier(0.25, 0.1, 0.25, 1)"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transitionDuration: isSpinning ? '3500ms' : '0ms'
                    }}
                >
                    {participants.map((p, i) => {
                        const angle = sliceAngle * i;
                        const color = colors[i % colors.length];
                        return (
                            <div
                                key={p.id}
                                className="absolute w-full h-[50%] top-0 left-0 origin-bottom flex justify-center pt-4"
                                style={{
                                    transform: `rotate(${angle}deg)`,
                                    backgroundColor: color,
                                    clipPath: participants.length <= 2
                                        ? 'none' // 2명일 땐 반반
                                        : `polygon(50% 100%, 0 0, 100% 0)` // 간단한 부채꼴 근사 (정확하진 않지만 svg 없이 간단 구현 시)
                                    // SVG가 아니면 부채꼴 짤라내기가 힘들다.
                                    // CSS conic-gradient가 제일 낫다.
                                }}
                            >
                                {/* 텍스트는 다시 반대로 돌려야 읽기 편함 */}
                                {/* 하지만 conic-gradient 방식이 아니면 div로 부채꼴 만들기 까다로움. */}
                                {/* 간단히 conic-gradient로 배경 깔고 텍스트만 배치하자. */}
                            </div>
                        );
                    })}

                    {/* Re-implement using Conic Gradient for background, and absolute divs for text only */}
                    <div
                        className="absolute inset-0 w-full h-full rounded-full"
                        style={{
                            background: `conic-gradient(${participants.map((p, i) => {
                                const start = (i * 100) / participants.length;
                                const end = ((i + 1) * 100) / participants.length;
                                return `${colors[i % colors.length]} ${start}% ${end}%`;
                            }).join(', ')
                                })`
                        }}
                    />

                    {/* Example Texts */}
                    {participants.map((p, i) => {
                        // 각 조각의 중심 각도
                        const centerAngle = (sliceAngle * i) + (sliceAngle / 2);
                        return (
                            <div
                                key={p.id}
                                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                style={{ transform: `rotate(${centerAngle}deg)` }}
                            >
                                <span
                                    className="absolute top-6 left-1/2 -translate-x-1/2 text-white font-bold text-sm drop-shadow-md"
                                    style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }} // 세로쓰기? or just transform
                                >
                                    {p.nickname}
                                </span>
                            </div>
                        )
                    })}
                </div>

                {/* Center Cap */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md z-10" />
            </div>

            <button
                onClick={handleSpin}
                disabled={isSpinning}
                className="px-8 py-3 bg-gray-900 text-white rounded-full font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSpinning ? '돌아가는 중...' : '룰렛 돌리기!'}
            </button>
        </div>
    );
}
