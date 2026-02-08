
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
    const [isNextLoading, setIsNextLoading] = useState(false);

    // Type Definitions (Moved to top level)
    const isVoteType = currentQuestion?.type?.startsWith('vote_');
    const isFreeVoteType = ['vote_image', 'vote_praise'].includes(currentQuestion?.type || '');
    const isBalanceType = currentQuestion?.type?.startsWith('balance_') || currentQuestion?.type === 'C';
    const isRouletteType = currentQuestion?.type?.startsWith('roulette_');
    const isMissionType = !isRouletteType && (
        currentQuestion?.type?.startsWith('mission_') ||
        currentQuestion?.type?.startsWith('talk_') ||
        currentQuestion?.type === 'Q'
    );


    const [chatMessages, setChatMessages] = useState<{ sender: string, text: string }[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [freeVoteInput, setFreeVoteInput] = useState('');

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

        // DB Insert for Result View (Persistence)
        supabase.from('room_messages' as any).insert({
            room_id: room.id,
            question_id: currentQuestion?.id,
            nickname: currentUser?.nickname || '익명',
            message: chatInput
        }).then(({ error }) => {
            if (error) console.error('Message save failed:', error);
        });
    };

    // Timer Logic using useCountdown Hook
    const { timeLeft, isTimeOver } = useCountdown(currentQuestion?.timer || 30);

    const isInteractionDisabled = isVoting || isTimeOver;

    // Auto-transition: When time is over, Host triggers 'Show Result' automatically after 1 second
    useEffect(() => {
        if (isTimeOver && currentUser?.is_host) {
            const timeout = setTimeout(() => {
                handleShowResult();
            }, 1000); // 1초 뒤 자동 이동 (시간 종료 메시지 노출용)
            return () => clearTimeout(timeout);
        }
    }, [isTimeOver, currentUser?.is_host]);


    // Check if I voted
    // For free vote, we check against game_actions if possible, OR we rely on local isVoting state for immediate feedback
    // Ideally we should fetch myVote from game_actions too, but for now we rely on the votes prop OR local state.
    // If ResultView fetches game_actions, we might expect votes prop to NOT include it, unless RoomPage is updated.
    // We will assume 'votes' prop covers standard votes, and we might need to check if I submitted a free vote.
    // For simplicity, we reuse 'myVote' logic if the system was using 'votes' table.
    // But since we are writing to 'game_actions', 'myVote' from props (which reads 'votes') will be undefined.
    // So we need a flag 'hasSubmittedFreeVote'.
    const [hasSubmittedFreeVote, setHasSubmittedFreeVote] = useState(false);

    const myVote = votes.find(v => v.voter_id === currentUser?.id && v.question_id === room?.current_question_id);
    const totalVotes = votes.length; // This might be inaccurate for free votes if RoomPage doesn't fetch them.
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

    const handleFreeVote = async () => {
        if (isInteractionDisabled || hasSubmittedFreeVote || !room || !currentQuestion || !currentUser || !freeVoteInput.trim()) return;
        setIsVoting(true);

        try {
            await supabase.from('game_actions' as any).insert({
                room_id: room.id,
                question_id: currentQuestion.id,
                voter_id: currentUser.id, // Assuming column exists
                target_value: freeVoteInput.trim(),
                action_type: 'vote' // Optional: if DB requires type
            });
            setHasSubmittedFreeVote(true);
        } catch (e) {
            console.error(e);
            alert('전송 실패');
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

    // Type definitions moved to top

    // Senior Mode Logic
    const { isSeniorMode } = useGameStore();

    // Helper classes for Senior Mode
    const textClassQuestion = isSeniorMode
        ? "text-4xl font-black leading-snug tracking-tight text-black drop-shadow-sm"
        : "text-xl font-black text-gray-900 leading-tight break-keep";

    const textClassOption = isSeniorMode
        ? "text-3xl font-black text-black leading-snug"
        : "text-5xl md:text-6xl font-black break-keep text-gray-900 drop-shadow-sm"; // Balance Game Options

    const textClassVoteBtn = isSeniorMode
        ? "font-black text-black text-3xl"
        : "font-black text-gray-900 text-2xl";

    const containerClass = isSeniorMode
        ? "border-4 border-black shadow-none ring-4 ring-black/10"
        : "border border-gray-100 shadow-lg";

    const btnClass = isSeniorMode
        ? "border-4 border-black shadow-none active:bg-gray-200"
        : "border-2 border-gray-200 shadow-md hover:shadow-xl hover:border-indigo-300";


    if (!currentQuestion) return <div className="p-10 text-center flex flex-col items-center gap-4"><Loader2 className="animate-spin text-primary w-8 h-8" /><span>문제 출제 중...</span></div>;

    return (
        <div className={`flex flex-col min-h-[100dvh] pb-[100px] relative overflow-hidden ${isSeniorMode ? 'bg-white' : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'}`}>

            {/* 1. Header & Progress Timer */}
            {/* 1. Header & Progress Timer - FIXED TOP */}
            <div className={`fixed top-0 left-0 w-full z-50 bg-white shadow-md pt-safe-top ${isSeniorMode ? 'border-b-4 border-black' : 'border-b border-gray-100'}`}>
                {currentQuestion.timer && (
                    <div className="h-1.5 w-full bg-gray-100 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 ease-linear will-change-transform ${isSeniorMode ? 'bg-black' : 'bg-gradient-to-r from-primary to-secondary'}`}
                            style={{ width: `${(timeLeft / currentQuestion.timer) * 100}%` }}
                        />
                    </div>
                )}
                <div className="px-4 py-3 flex justify-end items-center relative">
                    {/* Header Text Removed */}
                    {/* Senior Mode Indicator */}
                    {isSeniorMode && <span className="absolute left-4 top-3 text-sm font-bold bg-black text-white px-2 py-0.5 rounded">시니어 모드</span>}
                </div>
            </div>

            {/* 2. Main Content Area - Refined Spacing */}
            <div className="flex-1 w-full max-w-lg mx-auto overflow-y-auto px-6 pt-24 pb-80 flex flex-col gap-8 no-scrollbar">

                {/* Question Card Block */}
                <div className="flex-shrink-0">
                    <div
                        key={currentQuestion.id}
                        className={`bg-white rounded-3xl p-6 relative overflow-hidden ${containerClass}`}
                    >
                        {/* Decorative Top Bar - Hide in Senior Mode for cleaner look */}
                        {!isSeniorMode && <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary" />}

                        {/* Question Content */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base font-bold shrink-0 ${isSeniorMode ? 'bg-black text-white' : 'bg-primary/10 text-primary'}`}>
                                Q
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-wider ${isSeniorMode ? 'text-black text-sm' : 'text-gray-400'}`}>
                                {currentQuestion.type?.replace(/_/g, ' ')}
                            </span>
                        </div>

                        <h2 className={`${textClassQuestion} mb-3`}>
                            {currentQuestion.content}
                        </h2>

                        {/* Instruction Hint */}
                        <p className={`font-medium ${isSeniorMode ? 'text-base text-gray-600 font-bold' : 'text-xs text-gray-400'}`}>
                            {isVoteType ? (isFreeVoteType ? '👇 이름을 직접 입력하세요' : '👇 투표할 대상을 선택하세요') : isBalanceType ? '👇 하나를 선택하세요' : '💬 자유롭게 이야기해보세요'}
                        </p>
                    </div>
                </div>

                {/* Voting Options Block */}
                <div className="flex-1 flex flex-col w-full min-h-0">
                    {/* 1. People Voting */}
                    {isVoteType && (
                        isFreeVoteType ? (
                            !hasSubmittedFreeVote ? (
                                <div className="flex flex-col gap-4 w-full">
                                    <input
                                        type="text"
                                        value={freeVoteInput}
                                        onChange={(e) => setFreeVoteInput(e.target.value)}
                                        placeholder="이름을 입력하세요 (예: 민수)"
                                        className={`w-full h-16 text-center text-xl rounded-xl focus:ring-0 outline-none transition-all placeholder:text-gray-300 font-bold bg-white ${isSeniorMode ? 'border-4 border-black text-2xl h-20 placeholder:text-gray-400' : 'border-2 border-indigo-200 focus:border-indigo-500'}`}
                                    />
                                    <button
                                        onClick={handleFreeVote}
                                        disabled={!freeVoteInput.trim() || isInteractionDisabled}
                                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-md active:scale-95 transition-all disabled:bg-gray-300 ${isSeniorMode ? 'bg-black text-white border-4 border-black text-2xl h-20' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                    >
                                        투표하기
                                    </button>
                                </div>
                            ) : (
                                <VotedState />
                            )
                        ) : (
                            !myVote ? (
                                <div className="grid grid-cols-2 gap-4 h-full content-start">
                                    {participants.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => handleVote(p.id)}
                                            disabled={isInteractionDisabled}
                                            className={`bg-white min-h-[100px] p-5 rounded-3xl flex flex-col items-center justify-center gap-3 active:scale-95 transition-all disabled:cursor-not-allowed ${btnClass}`}
                                        >
                                            <span className={`text-center leading-tight break-keep ${textClassVoteBtn}`}>
                                                {p.nickname}<span className={`font-bold text-gray-400 ${isSeniorMode ? 'text-xl text-gray-600' : 'text-lg'}`}>님</span>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <VotedState />
                            )
                        )
                    )}

                    {/* 2. Balance Game */}
                    {isBalanceType && (
                        !myVote ? (
                            <div className="flex flex-col gap-4 h-full">
                                {options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleVote(idx === 0 ? 'A' : 'B')}
                                        disabled={isInteractionDisabled}
                                        className={`flex-1 min-h-[160px] rounded-3xl font-bold active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-0 px-4 py-8 disabled:cursor-not-allowed
                                    ${isSeniorMode
                                                ? `border-4 border-black text-black bg-white hover:bg-gray-50 text-4xl shadow-none`
                                                : `border-4 shadow-lg hover:shadow-xl ${idx === 0 ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300' : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300'}`
                                            }`}
                                    >
                                        <span className={`text-center font-black break-keep drop-shadow-sm ${isSeniorMode ? 'text-4xl text-black leading-snug' : 'text-5xl md:text-6xl text-gray-900 leading-tight'}`}>{opt}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <VotedState />
                        )
                    )}

                    {/* 4. Roulette Game (Inline) */}
                    {isRouletteType && (
                        <div className={`bg-white rounded-3xl p-6 flex flex-col items-center justify-center flex-1 ${containerClass}`}>
                            {currentUser?.is_host ? (
                                <RouletteGame participants={participants} onComplete={async (winnerId) => {
                                    await handleVote(winnerId);
                                    setTimeout(() => handleShowResult(), 1000);
                                }} />
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-6xl mb-4 animate-spin-slow inline-block">🎡</div>
                                    <h3 className={`font-bold mb-1 ${isSeniorMode ? 'text-2xl text-black' : 'text-lg text-gray-800'}`}>룰렛 돌아가는 중...</h3>
                                    <p className="text-gray-400 text-sm">누가 당첨될까요?</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 5. Mission / Talk Game (Realtime Chat) */}
                    {isMissionType && (
                        <div className="flex-1 w-full flex flex-col p-4 h-full min-h-0">
                            <div className={`flex-1 w-full max-w-sm mx-auto bg-white/50 backdrop-blur-sm rounded-3xl p-4 flex flex-col gap-2 overflow-hidden ${isSeniorMode ? 'border-4 border-black bg-white shadow-none' : 'shadow-sm border border-white/50'}`}>
                                {/* Chat List */}
                                <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-2 scrollbar-hide">
                                    {chatMessages.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-50">
                                            <div className="text-4xl mb-2">💬</div>
                                            <p className={`text-sm ${isSeniorMode ? 'text-lg text-black font-bold' : ''}`}>첫 번째 메시지를 남겨보세요!</p>
                                        </div>
                                    ) : (
                                        chatMessages.map((msg, idx) => {
                                            const isMe = msg.sender === currentUser?.nickname;
                                            return (
                                                <div key={idx} className="flex flex-col items-start w-full animate-slide-up">
                                                    <span className={`text-[11px] text-gray-500 mb-0.5 font-bold ml-1 ${isSeniorMode ? 'text-sm text-black' : ''}`}>{msg.sender}</span>
                                                    <div className={`px-4 py-2.5 rounded-xl border w-full break-words ${isSeniorMode ? 'border-2 border-black text-xl font-bold bg-white text-black' : 'border-gray-200 bg-white text-gray-900 shadow-sm text-base'}`}>
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. FOOTER AREA (Timer + Controls + Chat Input) */}
                    <div className={`fixed bottom-0 left-0 w-full z-50 px-6 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4 transition-all duration-300 flex flex-col gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] ${isTimeOver ? 'bg-gray-900/95 backdrop-blur-xl border-t border-white/10' : 'bg-white/95 backdrop-blur-xl border-t border-gray-100'} ${isSeniorMode ? '!bg-white !border-t-4 !border-black' : ''}`} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999 }}>
                        {/* Chat Input moved to Footer */}
                        {/* Chat Input moved to Footer - Hidden for 'mission_action' (Common Games) */}
                        {isMissionType && currentQuestion.type !== 'mission_action' && (
                            <div className="w-full max-w-lg mx-auto flex gap-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    // Enter triggers Chat OR Host Next? Chat is safer.
                                    onKeyDown={(e) => e.key === 'Enter' && !isInteractionDisabled && handleSendChat()}
                                    disabled={isInteractionDisabled}
                                    className={`flex-1 px-4 py-3 rounded-xl outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400 ${isSeniorMode ? 'border-4 border-black text-xl font-bold focus:bg-yellow-50 placeholder:text-gray-500' : 'border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm'}`}
                                    placeholder={isTimeOver ? "시간이 종료되었습니다" : "답변을 입력하세요..."}
                                />
                                <button
                                    onClick={handleSendChat}
                                    disabled={isInteractionDisabled}
                                    className={`p-3 rounded-xl transition-all flex items-center justify-center disabled:bg-gray-300 ${isSeniorMode ? 'bg-black text-white border-4 border-black w-16' : 'bg-primary text-white hover:bg-primary/90 active:scale-95 shadow-md '}`}
                                >
                                    <Send className={`w-5 h-5 ${isSeniorMode ? 'w-8 h-8' : ''}`} />
                                </button>
                            </div>
                        )}
                        {/* Message for mission_action only */}
                        {currentQuestion.type === 'mission_action' && (
                            <div className="w-full text-center pb-2">
                                <p className={`font-bold ${isSeniorMode ? 'text-black text-xl' : 'text-gray-500 text-sm'}`}>
                                    다 같이 행동으로 수행하는 미션입니다!
                                </p>
                            </div>
                        )}
                        {/* Timer Display */}
                        {currentQuestion.timer && (
                            <div className="flex justify-center w-full">
                                {isTimeOver ? (
                                    <div className={`flex items-center gap-3 px-6 py-2 rounded-full ${isSeniorMode ? 'bg-black text-white border-4 border-white' : 'text-white animate-pulse bg-red-500/20'}`}>
                                        <Lock className="w-6 h-6" />
                                        <span className="text-2xl font-black">시간 종료!</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${isSeniorMode ? 'bg-black text-white' : (timeLeft <= 10 ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500')}`}>
                                            <Timer className="w-8 h-8" />
                                        </div>
                                        <span className={`text-7xl font-black font-mono tabular-nums leading-none tracking-tight ${isSeniorMode ? 'text-black scale-110' : (timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-900')}`} style={{ fontSize: '5rem', lineHeight: 1 }}>
                                            {timeLeft}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Host Controls INSIDE Footer */}
                        {currentUser?.is_host && (isMissionType || totalVotes > 0) && (
                            <div className="w-full">
                                <button
                                    onClick={handleShowResult}
                                    className={`w-full h-16 rounded-2xl font-black transition-all flex items-center justify-center gap-3
                                    ${isSeniorMode
                                            ? 'bg-black text-white border-4 border-black text-3xl shadow-none hover:bg-gray-800'
                                            : 'bg-primary text-white text-2xl shadow-xl hover:bg-primary/90 active:scale-95'}`}
                                >
                                    {isMissionType ? '다음으로 넘어가기 ▶' : '결과 공개하기 🎉'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
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
