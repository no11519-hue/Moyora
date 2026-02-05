
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Check, Loader2, Sparkles, UserCircle2 } from 'lucide-react';
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
            alert('오류가 발생했습니다. 다시 시도해주세요.');
            setIsCreating(false);
        }
    };

    return (
        <div className="mobile-container flex flex-col relative bg-white">

            {/* Header */}
            <header className="h-14 flex items-center px-4 border-b border-neutral-100 bg-white sticky top-0 z-30">
                <Link href="/" className="p-2 -ml-2 text-neutral-600 hover:bg-neutral-50 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-[17px] font-bold text-neutral-900 ml-2">방 만들기</h1>
            </header>

            <div className="flex-1 flex flex-col px-6 pt-8 pb-32 overflow-y-auto">

                {/* Step 1: Nickname */}
                <section className="mb-10">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand text-white text-[10px] font-bold">1</span>
                        <label className="text-[15px] font-bold text-neutral-900">진행자 닉네임</label>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="친구들이 알아볼 이름을 입력하세요"
                            className="w-full h-[52px] pl-11 pr-4 rounded-xl border border-neutral-200 bg-neutral-50 text-[16px] text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                            autoFocus
                        />
                        <UserCircle2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
                    </div>
                </section>

                {/* Step 2: Category */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-colors ${selectedCategory ? 'bg-brand text-white' : 'bg-neutral-200 text-neutral-500'}`}>2</span>
                        <label className="text-[15px] font-bold text-neutral-900">모임 성격 선택</label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {CATEGORIES.map((cat) => {
                            const isSelected = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`
                                relative p-4 rounded-xl border text-left transition-all active:scale-[0.98]
                                flex flex-col gap-2
                                ${isSelected
                                            ? 'border-brand ring-1 ring-brand bg-brand-light'
                                            : 'border-neutral-200 bg-white hover:border-neutral-300'}
                            `}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className="text-2xl">{cat.emoji}</span>
                                        {isSelected && <Check className="w-4 h-4 text-brand" strokeWidth={3} />}
                                    </div>
                                    <div>
                                        <span className={`block text-[15px] font-bold ${isSelected ? 'text-brand' : 'text-neutral-900'}`}>
                                            {cat.label}
                                        </span>
                                        <span className="block text-[11px] text-neutral-500 mt-0.5 leading-snug">
                                            {cat.desc}
                                        </span>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </section>

            </div>

            {/* Sticky Bottom CTA */}
            <div className="fixed bottom-0 w-full max-w-[480px] p-5 pb-8 bg-white border-t border-neutral-100 shadow-sticky z-40">
                <button
                    onClick={handleCreate}
                    disabled={!isValid || isCreating}
                    className={`
                w-full h-[54px] rounded-2xl font-bold text-[17px] flex items-center justify-center gap-2 transition-all
                ${isValid
                            ? 'bg-brand text-white shadow-md hover:bg-brand-hover active:scale-[0.98]'
                            : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'}
            `}
                >
                    {isCreating ? <Loader2 className="animate-spin w-5 h-5" /> : (
                        <>
                            방 만들기 <Sparkles className="w-4 h-4 opacity-50" />
                        </>
                    )}
                </button>
            </div>

        </div>
    );
}

const CATEGORIES = [
    { id: 'introduction', label: '아이스브레이킹', emoji: '🧊', desc: '어색함 타파!' },
    { id: 'dating', label: '소개팅/미팅', emoji: '💘', desc: '두근두근 시그널' },
    { id: 'workshop', label: '워크숍/팀빌딩', emoji: '📢', desc: '팀워크 레벨업' },
    { id: 'drinking', label: '술자리 게임', emoji: '🍻', desc: '텐션 폭발!' },
];
