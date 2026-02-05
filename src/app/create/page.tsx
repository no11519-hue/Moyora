
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Check, Loader2, User } from 'lucide-react';
import Link from 'next/link';

export default function CreateRoomPage() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [nickname, setNickname] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const isValid = selectedCategory && nickname.length > 0;

    const handleCreate = async () => {
        if (!isValid || isCreating) return;
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
            alert('오류가 발생했습니다.');
            setIsCreating(false);
        }
    };

    return (
        <div className="mobile-container flex flex-col relative bg-white pb-20">

            {/* Header */}
            <header className="h-12 flex items-center px-4 sticky top-0 bg-white z-30">
                <Link href="/" className="p-2 -ml-2 text-neutral-500 hover:text-neutral-900">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-[16px] font-bold text-neutral-900 ml-1">방 만들기</h1>
            </header>

            <div className="flex-1 flex flex-col px-5 pt-4">

                {/* Step 1 */}
                <div className="mb-6">
                    <label className="block text-[13px] font-bold text-neutral-500 mb-2">1. 진행자 닉네임</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="이름 입력"
                            className="w-full h-11 pl-9 pr-4 rounded-lg bg-neutral-50 border border-neutral-200 text-sm font-bold focus:bg-white focus:border-neutral-900/30 outline-none transition-all"
                            autoFocus
                        />
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    </div>
                </div>

                {/* Step 2 */}
                <div>
                    <label className="block text-[13px] font-bold text-neutral-500 mb-2">2. 테마 선택</label>
                    <div className="flex flex-col gap-2">
                        {CATEGORIES.map((cat) => {
                            const isSelected = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`
                                w-full p-3.5 rounded-xl border flex items-center gap-3 transition-all active:scale-[0.98]
                                ${isSelected
                                            ? 'border-brand/50 bg-brand/5 ring-1 ring-brand/50'
                                            : 'border-neutral-100 bg-white hover:bg-neutral-50'}
                            `}
                                >
                                    <span className="text-xl">{cat.emoji}</span>
                                    <div className="flex-1 text-left">
                                        <span className={`block text-sm font-bold ${isSelected ? 'text-brand' : 'text-neutral-800'}`}>
                                            {cat.label}
                                        </span>
                                        <span className="block text-[11px] text-neutral-400">{cat.desc}</span>
                                    </div>
                                    {isSelected && <Check className="w-4 h-4 text-brand" />}
                                </button>
                            )
                        })}
                    </div>
                </div>

            </div>

            {/* Bottom CTA (Floating) */}
            <div className="fixed bottom-0 w-full max-w-[480px] p-5 bg-gradient-to-t from-white via-white to-transparent z-40">
                <button
                    onClick={handleCreate}
                    disabled={!isValid || isCreating}
                    className={`
                w-full h-12 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 shadow-sm transition-all
                ${isValid
                            ? 'bg-neutral-900 text-white hover:bg-black active:scale-[0.98]'
                            : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'}
            `}
                >
                    {isCreating ? <Loader2 className="animate-spin w-4 h-4" /> : '시작하기'}
                </button>
            </div>

        </div>
    );
}

const CATEGORIES = [
    { id: 'introduction', label: '아이스브레이킹', emoji: '🧊', desc: '가벼운 질문들' },
    { id: 'dating', label: '소개팅/미팅', emoji: '💘', desc: '설레는 시그널' },
    { id: 'workshop', label: '워크숍/팀빌딩', emoji: '📢', desc: '팀워크 다지기' },
    { id: 'drinking', label: '술자리 게임', emoji: '🍻', desc: '텐션 폭발!' },
];
