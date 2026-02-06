
'use client';

import { useGameStore } from '@/store/gameStore';
import { supabase } from '@/lib/supabase';
import { Loader2, Play, Users, Share2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useState } from 'react';

import { useTurnStore } from '@/store/turnStore';

export default function LobbyView() {
    const { room, participants, currentUser } = useGameStore();
    const [isStarting, setIsStarting] = useState(false);
    const { fetchTurn, playNextGame } = useTurnStore();

    if (!room) return <div className="p-10 text-center">Loading...</div>;

    const handleStart = async () => {
        setIsStarting(true);
        try {
            // 1. Fetch New Turn (Reset)
            await fetchTurn(true);

            // 2. Play First Game
            const success = await playNextGame(room.id);

            if (!success) {
                alert('게임을 불러오지 못했습니다.');
                setIsStarting(false);
            }
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

            {/* Participants Grid - 2 COLUMN CHUNKY CARD LAYOUT */}
            <div className="w-full max-w-md grid grid-cols-2 gap-3 mb-32 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {participants.map((p) => (
                    <div
                        key={p.id}
                        className="bg-white shadow-sm rounded-xl p-4 flex flex-col items-center gap-3 relative border-2 border-gray-100 hover:border-indigo-100 transition-colors"
                    >
                        {/* Avatar Circle */}
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center text-3xl shadow-inner relative overflow-hidden">
                            <span className="z-10 font-black text-indigo-600">{p.nickname[0]}</span>
                            {p.is_host && (
                                <div className="absolute inset-0 bg-yellow-100 opacity-40 border-4 border-yellow-300 rounded-full animate-pulse" />
                            )}
                        </div>

                        {/* Nickname with Truncate */}
                        <span className="text-lg font-bold text-gray-900 truncate w-full text-center px-1">
                            {p.nickname}
                        </span>

                        {/* Host Badge */}
                        {p.is_host && (
                            <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                                👑
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Host Controls */}
            {currentUser?.is_host && (
                <div className="sticky bottom-0 w-full max-w-md px-6 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] bg-white border-t border-gray-200 z-20">
                    <button
                        onClick={handleStart}
                        disabled={participants.length < 2 || isStarting}
                        className={`
              w-full h-24 rounded-3xl font-black text-3xl shadow-2xl flex items-center justify-center gap-3 mb-4
              transition-all duration-200 border-4
              ${participants.length < 2
                                ? 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-primary border-primary-foreground/20 text-white hover:scale-[1.02] active:scale-95 hover:bg-primary/90'}
            `}
                    >
                        {isStarting ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <Play className="w-6 h-6 fill-current" />
                                게임 시작 🎮
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
