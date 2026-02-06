
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface JoinFormProps {
    roomId: string; // UUID
    onJoin: (participant: any) => void;
}

export default function JoinForm({ roomId, onJoin }: JoinFormProps) {
    const [nickname, setNickname] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const handleJoin = async () => {
        if (!nickname.trim()) return;
        setIsJoining(true);

        try {
            const { data, error } = await supabase
                .from('participants')
                .insert({
                    room_id: roomId,
                    nickname: nickname.trim(),
                    is_host: false,
                })
                .select()
                .single();

            if (error) throw error;

            // Save to local storage
            localStorage.setItem(`moyora_user_${data.id}`, JSON.stringify(data)); // Wait, naming convention: moyora_user_ROOMID?
            // In CreatePage I used `moyora_user_${room.id}`. So I should stick to that. 
            // Actually finding the user by room id is easier. 
            localStorage.setItem(`moyora_user_${roomId}`, JSON.stringify(data));

            onJoin(data);
        } catch (e) {
            console.error(e);
            alert('입장 중 오류가 발생했습니다.');
            setIsJoining(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="w-full max-w-md space-y-6 animate-slide-up">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black mb-3 text-gray-900">닉네임을 알려주세요!</h2>
                    <p className="text-gray-500 text-base">게임에서 사용할 이름입니다.</p>
                </div>

                {/* Input Field - LARGE & FULL WIDTH */}
                <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                    placeholder="별명 입력 (예: 개발왕)"
                    className="w-full h-16 text-center px-6 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 text-xl font-medium outline-none transition-all bg-white shadow-sm"
                    autoFocus
                    maxLength={20}
                />

                {/* Submit Button - LARGE & FULL WIDTH */}
                <button
                    onClick={handleJoin}
                    disabled={!nickname.trim() || isJoining}
                    className="w-full h-16 text-white bg-indigo-600 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 flex justify-center items-center gap-2"
                >
                    {isJoining ? (
                        <Loader2 className="animate-spin w-6 h-6" />
                    ) : (
                        '입장하기 🚀'
                    )}
                </button>

                {/* Helper Text */}
                <p className="text-center text-sm text-gray-400 mt-4">
                    엔터키를 눌러도 입장할 수 있어요
                </p>
            </div>
        </div>
    );
}
