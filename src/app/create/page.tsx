
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Check, Loader2, User, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function CreateRoomPage() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [nickname, setNickname] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!selectedCategory || !nickname) return;
        setIsCreating(true);

        try {
            const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();

            const { data: room, error: roomError } = await supabase
                .from('rooms')
                .insert({
                    code: roomCode,
                    category: selectedCategory,
                    status: 'waiting',
                })
                .select()
                .single();

            if (roomError) throw roomError;

            const { data: participant, error: participantError } = await supabase
                .from('participants')
                .insert({
                    room_id: room.id,
                    nickname: nickname,
                    is_host: true,
                })
                .select()
                .single();

            if (participantError) throw participantError;

            localStorage.setItem(`moyora_user_${room.id}`, JSON.stringify(participant));
            router.push(`/room/${roomCode}`);

        } catch (error) {
            console.error('Error creating room:', error);
            alert('방 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col p-6 max-w-lg mx-auto">
            {/* Header */}
            <header className="flex items-center gap-4 mb-8 pt-2">
                <Link href="/" className="p-3 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors active:scale-95">
                    <ArrowLeft className="w-7 h-7" strokeWidth={2.5} />
                </Link>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    어떤 모임인가요?
                </h1>
            </header>

            <div className="flex-1 w-full flex flex-col gap-8">

                {/* Nickname Input */}
                <section className="animate-slide-up">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-3 px-1">
                        <User className="w-4 h-4" /> 진행자 닉네임
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 text-xl font-bold text-gray-900 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                            placeholder="예: 엠씨유"
                            autoFocus
                        />
                        {nickname && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary animate-scale-in">
                                <Check className="w-6 h-6" />
                            </div>
                        )}
                    </div>
                </section>

                {/* Categories Grid */}
                <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-3 px-1">
                        <Sparkles className="w-4 h-4" /> 테마 선택
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`
                  relative p-5 rounded-3xl border-2 text-left transition-all duration-200 group
                  flex flex-col gap-3 min-h-[140px]
                  ${selectedCategory === cat.id
                                        ? 'border-primary bg-primary/5 shadow-none scale-[0.98]'
                                        : 'border-transparent bg-white shadow-card hover:shadow-card-hover hover:-translate-y-1'}
                `}
                            >
                                {/* Icon Layer */}
                                <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform group-hover:scale-110
                    ${selectedCategory === cat.id ? 'bg-white' : cat.colorBg}
                `}>
                                    {cat.emoji}
                                </div>

                                {/* Text Layer */}
                                <div className="mt-auto">
                                    <span className={`block text-lg font-black leading-tight mb-1 ${selectedCategory === cat.id ? 'text-primary' : 'text-gray-800'}`}>
                                        {cat.label}
                                    </span>
                                    <span className="block text-xs font-medium text-gray-400 leading-snug">
                                        {cat.desc}
                                    </span>
                                </div>

                                {/* Check Mark */}
                                {selectedCategory === cat.id && (
                                    <div className="absolute top-4 right-4 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white shadow-lg animate-scale-in">
                                        <Check className="w-4 h-4" strokeWidth={3} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Floating CTA */}
                <div className="mt-auto pt-6 sticky bottom-6 z-10">
                    <button
                        onClick={handleCreate}
                        disabled={!selectedCategory || !nickname || isCreating}
                        className={`
              w-full py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-2 shadow-xl
              transition-all duration-300 border-b-4
              ${(!selectedCategory || !nickname || isCreating)
                                ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed transform-none'
                                : 'bg-primary text-white border-black/10 hover:scale-[1.02] active:scale-[0.98] active:border-b-0 active:translate-y-1 shadow-primary/30'}
            `}
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                방 만드는 중...
                            </>
                        ) : (
                            '시작하기'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

const CATEGORIES = [
    { id: 'introduction', label: '아이스\n브레이킹', emoji: '🧊', desc: '어색함 타파!', colorBg: 'bg-blue-50' },
    { id: 'dating', label: '두근두근\n소개팅', emoji: '💘', desc: '설레는 시그널', colorBg: 'bg-pink-50' },
    { id: 'workshop', label: '으샤으샤\n워크숍', emoji: '📢', desc: '팀워크 레벨업', colorBg: 'bg-green-50' },
    { id: 'drinking', label: '왁자지껄\n술자리', emoji: '🍻', desc: '텐션 폭발!', colorBg: 'bg-amber-50' },
];
