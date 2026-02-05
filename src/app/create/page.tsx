'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Check, Loader2, User, Info } from 'lucide-react';

const CATEGORIES = [
    { id: 'introduction', label: '아이스브레이킹', emoji: '🧊', desc: '어색한 공기를 깨는 가벼운 질문!' },
    { id: 'dating', label: '소개팅/미팅', emoji: '💘', desc: '상대방의 마음을 알아보는 설렘 가득 질문' },
    { id: 'workshop', label: '워크숍/팀빌딩', emoji: '📢', desc: '우리 팀 단합력 UP! 칭찬과 격려' },
    { id: 'drinking', label: '술자리 게임', emoji: '🍻', desc: '분위기 띄우는 화끈한 매운맛 질문' },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

export default function CreateRoomPage() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
    const [nickname, setNickname] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const trimmedNickname = useMemo(() => nickname.trim(), [nickname]);
    const isValid = Boolean(selectedCategory) && trimmedNickname.length > 0;

    const handleCreate = async () => {
        if (!isValid || isCreating || !selectedCategory) return;
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
                    nickname: trimmedNickname,
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
        <div className="mobile-container h-screen flex flex-col bg-white overflow-hidden">
            {/* Header */}
            <header className="h-14 flex items-center gap-1 px-4 bg-white border-b border-gray-100 shrink-0">
                <Link
                    href="/"
                    className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-50"
                    aria-label="홈으로"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-[17px] font-semibold text-gray-900">방 만들기</h1>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-8 pb-8">
                {/* Step 1 */}
                <section className="mb-10">
                    <label className="flex items-center gap-2 text-[15px] font-semibold text-gray-800 mb-4">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-[12px] font-bold">
                            1
                        </span>
                        진행자 닉네임
                    </label>

                    <div className="relative">
                        {/* Input */}
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="MC 닉네임 정하기"
                            className="w-full h-[56px] pl-4 pr-4 rounded-2xl bg-gray-50 border border-gray-200 text-[16px] text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                            autoFocus
                            inputMode="text"
                            autoCapitalize="off"
                            autoCorrect="off"
                            spellCheck={false}
                            maxLength={20}
                        />
                    </div>

                    <p className="mt-2 text-xs text-gray-400 leading-5">
                        예: 현, 민지, 팀장님 등
                    </p>
                </section>

                {/* Step 2 */}
                <section className="mb-6">
                    <label className="flex items-center gap-2 text-[15px] font-semibold text-gray-800 mb-4">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-[12px] font-bold">
                            2
                        </span>
                        모임 성격 선택
                    </label>

                    <div className="flex flex-col gap-3">
                        {CATEGORIES.map((cat) => {
                            const isSelected = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all active:scale-[0.98] text-left ${isSelected
                                        ? 'border-black bg-gray-50 ring-1 ring-black shadow-sm'
                                        : 'border-gray-100 bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <span className="text-2xl w-8 text-center">{cat.emoji}</span>
                                    <div className="flex-1 min-w-0">
                                        <span className={`block text-[15px] font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                            {cat.label}
                                        </span>
                                        <span className="block text-[12px] text-gray-400 mt-0.5">
                                            {cat.desc}
                                        </span>
                                    </div>
                                    {isSelected && (
                                        <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center shrink-0">
                                            <Check className="w-3.5 h-3.5 text-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Guide Text */}
                <div className="mt-6 p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-blue-800 flex gap-3 items-start">
                    <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
                    <p className="text-xs leading-5 text-blue-700">
                        <span className="font-bold">TIP</span>: 어떤 테마를 고를지 고민되시나요?
                        <br />
                        어색한 사이라면 <span className="font-bold">'아이스브레이킹'</span>이 가장 무난해요!
                    </p>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="shrink-0 border-t border-gray-200 bg-white px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
                <div className="mx-auto w-full max-w-[480px]">
                    <button
                        type="button"
                        onClick={handleCreate}
                        disabled={!isValid || isCreating}
                        className={`w-full h-[58px] rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 transition-all shadow-lg ${isValid
                            ? 'bg-[#111827] text-white hover:bg-black active:scale-[0.98]'
                            : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                            }`}
                    >
                        {isCreating ? <Loader2 className="animate-spin w-5 h-5" /> : '시작하기'}
                    </button>
                </div>
            </div>
        </div>
    );
}
