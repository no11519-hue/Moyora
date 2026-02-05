
'use client';

import { useGameStore } from '@/store/gameStore';
import { supabase } from '@/lib/supabase';
import { Loader2, Play, Users, Share2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useState } from 'react';

export default function LobbyView() {
    const { room, participants, currentUser } = useGameStore();
    const [isStarting, setIsStarting] = useState(false);

    if (!room) return <div className="p-10 text-center">Loading...</div>;

    const handleStart = async () => {
        setIsStarting(true);
        try {
            // 1. Fetch questions for category
            const { data: questions } = await supabase
                .from('questions')
                .select('id')
                .eq('category', room.category);

            if (!questions || questions.length === 0) {
                alert('질문이 없습니다!');
                setIsStarting(false);
                return;
            }

            // 2. Pick random/first question
            const randomQ = questions[Math.floor(Math.random() * questions.length)];

            // 3. Update Room
            await supabase
                .from('rooms')
                .update({
                    status: 'playing',
                    current_question_id: randomQ.id,
                })
                .eq('id', room.id);

        } catch (e) {
            console.error(e);
            setIsStarting(false);
        }
    };

    const inviteUrl = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <div className="flex flex-col items-center p-6 min-h-screen bg-white">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-8">
                <span className="font-bold text-lg text-primary">#{room.code}</span>
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-bold">{participants.length}명</span>
                </div>
            </div>

            {/* QR Code (Host Only or Everyone? PRD: "Host shows QR") */}
            <div className="bg-white p-4 rounded-3xl shadow-xl border border-gray-100 mb-8 animate-slide-up">
                <QRCode value={inviteUrl} size={180} />
            </div>

            <div className="w-full max-w-sm text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">
                    {currentUser?.is_host ? '참가자를 기다리고 있어요' : '방장이 곧 게임을 시작합니다'}
                </h2>
                <p className="text-gray-500 text-sm">QR코드를 스캔해서 입장하세요!</p>
            </div>

            {/* Participants Grid */}
            <div className="w-full max-w-sm grid grid-cols-4 gap-4 mb-20 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {participants.map((p) => (
                    <div key={p.id} className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl shadow-inner relative overflow-hidden">
                            {/* Simple avatar generation based on nickname */}
                            <span className="z-10">{p.nickname[0]}</span>
                            {p.is_host && (
                                <div className="absolute inset-0 bg-yellow-100 opacity-50 border-2 border-yellow-400 rounded-full" />
                            )}
                        </div>
                        <span className="text-xs text-gray-700 truncate w-full text-center font-medium">
                            {p.nickname}
                        </span>
                    </div>
                ))}
            </div>

            {/* Host Controls */}
            {currentUser?.is_host && (
                <div className="fixed bottom-6 w-full max-w-md px-6 z-20">
                    <button
                        onClick={handleStart}
                        disabled={participants.length < 2 || isStarting}
                        className={`
              w-full py-4 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-2
              transition-all duration-200
              ${participants.length < 2
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-primary text-white hover:scale-[1.02] hover:bg-primary/90'}
            `}
                    >
                        {isStarting ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <Play className="w-6 h-6 fill-current" />
                                게임 시작
                            </>
                        )}
                    </button>
                    {participants.length < 2 && (
                        <p className="text-center text-xs text-gray-400 mt-2">최소 2명이 필요해요</p>
                    )}
                </div>
            )}
        </div>
    );
}
