
'use client';

import { useGameStore } from '@/store/gameStore';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { Loader2, Zap, Timer, Check, Info, Send, Lock } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';

interface VotingViewProps {
    votes: any[];
}

export default function VotingView({ votes }: VotingViewProps) {
    const { room, participants, currentUser, currentQuestion } = useGameStore();
    const [isVoting, setIsVoting] = useState(false);
    const [chatMessages, setChatMessages] = useState<{ sender: string, text: string }[]>([]);
    const [chatInput, setChatInput] = useState('');

    useEffect(() => {
        if (!room) return;
        const channel = supabase.channel(`room:${room.id}`);
        channel
            .on('broadcast', { event: 'chat' }, ({ payload }: { payload: { sender: string, text: string } }) => {
                setChatMessages(prev => [...prev, payload]);
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [room]);

    const handleSendChat = async () => {
        if (!chatInput.trim() || !room) return;
        const payload = { sender: currentUser?.nickname || '익명', text: chatInput };
        setChatMessages(prev => [...prev, payload]);

        await supabase.channel(`room:${room.id}`).send({
            type: 'broadcast',
            event: 'chat',
            payload
        });
        setChatInput('');
    };

    // Timer Logic using useCountdown Hook
    const { timeLeft, isTimeOver } = useCountdown(currentQuestion?.timer || 30);

    const isInteractionDisabled = isVoting || isTimeOver;


    // Check if I voted
    const myVote = votes.find(v => v.voter_id === currentUser?.id && v.question_id === room?.current_question_id);
    const totalVotes = votes.length;
    const totalParticipants = participants.length;

    const handleVote = async (targetId: string) => {
        if (isInteractionDisabled || myVote || !room || !currentQuestion || !currentUser) return;
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
    const isBalanceType = currentQuestion?.type?.startsWith('balance_') || currentQuestion?.type === 'C';
    const isRouletteType = currentQuestion?.type?.startsWith('roulette_');
    const isMissionType = !isRouletteType && (
        currentQuestion?.type?.startsWith('mission_') ||
        currentQuestion?.type?.startsWith('talk_') ||
        currentQuestion?.type === 'Q'
    );

    if (!currentQuestion) return <div className="p-10 text-center flex flex-col items-center gap-4"><Loader2 className="animate-spin text-primary w-8 h-8" /><span>문제 출제 중...</span></div>;

    return (
        <div className="flex flex-col min-h-[100dvh] bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-[100px] relative overflow-hidden">

            {/* 1. Header & Progress Timer */}
            {/* 1. Header & Progress Timer - FIXED TOP */}
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md border-b border-gray-100 pt-safe-top">
                {currentQuestion.timer && (
                    <div className="h-1.5 w-full bg-gray-100 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-linear will-change-transform"
                            style={{ width: `${(timeLeft / currentQuestion.timer) * 100}%` }}
                        />
                    </div>
                )}
                <div className="px-4 py-3 flex justify-end items-center relative">
                    {/* Header Text Removed */}

                    {/* Timer moved to bottom */}
                </div>
            </div>

            {/* 2. Main Content Area - Refined Spacing */}
            <div className="flex-1 w-full max-w-lg mx-auto overflow-y-auto px-6 pt-10 pb-32 flex flex-col gap-8">

                {/* Question Card Block - COMPACT (40% space) */}
                <div className="flex-shrink-0">
                    <div
                        key={currentQuestion.id}
                        className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 relative overflow-hidden"
                    >
                        {/* Decorative Top Bar */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary" />

                        {/* Question Content - COMPACT */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-base font-bold text-primary shrink-0">
                                Q
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                {currentQuestion.type?.replace(/_/g, ' ')}
                            </span>
                        </div>

                        <h2 className="text-xl font-black text-gray-900 leading-tight break-keep mb-3">
                            {currentQuestion.content}
                        </h2>

                        {/* Instruction Hint */}
                        <p className="text-xs font-medium text-gray-400">
                            {isVoteType ? '👇 투표할 대상을 선택하세요' : isBalanceType ? '👇 하나를 선택하세요' : '💬 자유롭게 이야기해보세요'}
                        </p>
                    </div>
                </div>

                {/* Voting Options Block - DOMINANT (60% space, flex-1) */}
                <div className="flex-1 flex flex-col w-full min-h-0">
                    {/* 1. People Voting - 2 COLUMN MASSIVE GRID */}
                    {isVoteType && (
                        !myVote ? (
                            <div className="grid grid-cols-2 gap-4 h-full content-start">
                                {participants.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => handleVote(p.id)}
                                        disabled={isInteractionDisabled}
                                        className="bg-white min-h-[100px] p-5 rounded-3xl border-2 border-gray-200 flex flex-col items-center justify-center gap-3 active:scale-95 transition-all shadow-md hover:shadow-xl hover:border-indigo-300 disabled:opacity-50 disabled:grayscale"
                                    >
                                        <span className="font-black text-gray-900 text-2xl text-center leading-tight break-keep">
                                            {p.nickname}<span className="text-lg font-bold text-gray-400">님</span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <VotedState />
                        )
                    )}

                    {/* 2. Balance Game - TWO GIANT VERTICAL BLOCKS */}
                    {isBalanceType && (
                        !myVote ? (
                            <div className="flex flex-col gap-4 h-full">
                                {options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleVote(idx === 0 ? 'A' : 'B')}
                                        disabled={isInteractionDisabled}
                                        className={`flex-1 min-h-[140px] rounded-2xl font-bold border-4 shadow-md active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-0 px-4 py-6 disabled:opacity-50 disabled:grayscale hover:shadow-lg
                                    ${idx === 0
                                                ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300'
                                                : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300'}
                                `}
                                    >
                                        <span className="text-center leading-tight text-4xl font-black break-keep text-gray-900 drop-shadow-sm">{opt}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <VotedState />
                        )
                    )}

                    {/* 4. Roulette Game (Inline) */}
                    {isRouletteType && (
                        <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-200 flex flex-col items-center justify-center flex-1">
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

                    {/* 5. Mission / Talk Game (Realtime Chat) */}
                    {isMissionType && (
                        <div className="flex-1 w-full flex flex-col p-4 h-full min-h-0">
                            <div className="flex-1 w-full max-w-sm mx-auto bg-white/50 backdrop-blur-sm rounded-3xl p-4 shadow-sm border border-white/50 flex flex-col gap-2 overflow-hidden">
                                {/* Chat List */}
                                <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-2 scrollbar-hide">
                                    {chatMessages.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-50">
                                            <div className="text-4xl mb-2">💬</div>
                                            <p className="text-sm">첫 번째 메시지를 남겨보세요!</p>
                                        </div>
                                    ) : (
                                        chatMessages.map((msg, idx) => {
                                            const isMe = msg.sender === currentUser?.nickname;
                                            return (
                                                <div key={idx} className="flex flex-col items-start w-full animate-slide-up">
                                                    <span className="text-[11px] text-gray-500 mb-0.5 font-bold ml-1">{msg.sender}</span>
                                                    <div className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 w-full shadow-sm text-base break-words">
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Chat Input */}
                                <div className="flex gap-2 mt-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !isInteractionDisabled && handleSendChat()}
                                        disabled={isInteractionDisabled}
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm disabled:bg-gray-100 disabled:text-gray-400"
                                        placeholder={isTimeOver ? "시간이 종료되었습니다" : "답변을 입력하세요..."}
                                    />
                                    <button
                                        onClick={handleSendChat}
                                        disabled={isInteractionDisabled}
                                        className="bg-primary text-white p-3 rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-md flex items-center justify-center disabled:bg-gray-300"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. FOOTER AREA (Timer + Controls) */}
                    <div className={`fixed bottom-0 left-0 w-full z-40 px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 transition-all duration-300 ${isTimeOver ? 'bg-gray-900/90 backdrop-blur-md' : 'bg-gradient-to-t from-white via-white/90 to-transparent'}`}>
                        {/* Timer Display */}
                        {currentQuestion.timer && (
                            <div className="flex justify-center mb-3">
                                {isTimeOver ? (
                                    <div className="flex items-center gap-2 text-white animate-pulse">
                                        <Lock className="w-6 h-6" />
                                        <span className="text-2xl font-black">시간 종료!</span>
                                    </div>
                                ) : (
                                    <div className="flex  items-center gap-2">
                                        <Timer className="w-8 h-8 text-gray-400" />
                                        <span className={`text-7xl font-black font-mono tabular-nums leading-none ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-900'}`}>
                                            {timeLeft}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Bottom Control Bar (Sticky) */}
                {/* 3. Bottom Control Bar - FIXED BOTTOM */}
                {/* Host Controls (If Timer is footer, this stacks above or replaces?) */}
                {/* Merging into Footer container */}
                {currentUser?.is_host && (isMissionType || totalVotes > 0) && (
                    <button
                        onClick={handleShowResult}
                        className="w-full h-14 bg-primary text-white rounded-2xl font-black text-xl shadow-xl hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 max-w-lg mx-auto"
                    >
                        {isMissionType ? '다음으로 넘어가기 ▶' : '결과 공개하기 🎉'}
                    </button>
                )}
            </div>
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
