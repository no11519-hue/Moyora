
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
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center animate-slide-up">
            <div className="w-full max-w-xs space-y-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2">닉네임을 알려주세요!</h2>
                    <p className="text-gray-500">게임에서 사용할 이름입니다.</p>
                </div>

                <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="별명 입력 (예: 개발왕)"
                    className="w-full text-center px-4 py-3 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-lg outline-none transition-all"
                />

                <button
                    onClick={handleJoin}
                    disabled={!nickname || isJoining}
                    className="w-full py-4 text-white bg-primary rounded-xl font-bold text-lg shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {isJoining ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                        '입장하기'
                    )}
                </button>
            </div>
        </div>
    );
}
