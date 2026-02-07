'use client';

import { useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Check, Loader2, Info } from 'lucide-react';

const CATEGORIES = [
    { id: 'icebreaking', label: '아이스브레이킹', emoji: '🧊', desc: '어색한 공기를 깨는 가벼운 질문!' },
    { id: 'meeting', label: '미팅/소개팅', emoji: '💘', desc: '상대방의 마음을 알아보는 설렘 가득 질문' },
    { id: 'drinking', label: '술자리 게임', emoji: '🍻', desc: '분위기 띄우는 화끈한 매운맛 질문' },
    { id: 'crewmode', label: '팀 빌딩/워크숍', emoji: '⚡', desc: '우리 팀 단합력 UP! 칭찬과 격려' },
    { id: 'reply7080', label: '응답하라 7080', emoji: '📼', desc: '추억의 동창회/동호회 토크 (공통게임X)' },
    { id: 'bravo_life', label: '브라보 마이 라이프', emoji: '🌟', desc: '골든에이지 취향/건강/여행 토크 (공통게임X)' },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

function CreateRoomContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL param 'theme'
    const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(() => {
        const theme = searchParams.get('theme');
        if (theme === 'dating') return 'meeting';
        if (theme === 'retro7080') return 'reply7080';
        if (theme === 'goldenlife') return 'bravo_life';

        const isValid = CATEGORIES.some(c => c.id === theme);
        return isValid ? (theme as CategoryId) : 'icebreaking';
    });

    const [nickname, setNickname] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const trimmedNickname = useMemo(() => nickname.trim(), [nickname]);
    const nicknameRegex = /^[가-힣a-zA-Z0-9 ]+$/;
    const isNicknameValid = (trimmedNickname.length >= 1 && trimmedNickname.length <= 8 && nicknameRegex.test(trimmedNickname));
    const isValid = Boolean(selectedCategory) && isNicknameValid;

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
        <div className="mobile-container w-full max-w-[480px] mx-auto min-h-[100dvh] flex flex-col bg-white">
            {/* Header */}
            <header className="h-12 flex items-center gap-1 px-4 bg-white border-b border-gray-100 shrink-0">
                <Link
                    href="/"
                    className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-50"
                    aria-label="홈으로"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-[16px] font-semibold text-gray-900">방 만들기</h1>
            </header>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-5 pt-3 pb-3">
                {/* Step 1 */}
                <section className="mb-4">
                    <label className="flex items-center gap-2 text-[14px] font-semibold text-gray-800 mb-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-[12px] font-bold">
                            1
                        </span>
                        진행자 닉네임
                    </label>

                    <div className="flex flex-col gap-1">
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => {
                                setNickname(e.target.value);
                            }}
                            placeholder="MC 닉네임 정하기 (1~8글자)"
                            className={`w-full h-16 px-6 rounded-2xl bg-gray-50 border-2 text-lg font-bold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-0 outline-none transition-all shadow-sm ${nickname.length > 0 && !isNicknameValid
                                ? 'border-red-300 focus:border-red-500 bg-red-50'
                                : 'border-gray-200 focus:border-black'
                                }`}
                            autoFocus
                            inputMode="text"
                            autoCapitalize="off"
                            autoCorrect="off"
                            spellCheck={false}
                            maxLength={8} // Constraint
                        />

                        {nickname.length > 0 && !isNicknameValid && (
                            <p className="text-red-500 text-xs font-medium px-2 animate-pulse">🚨 닉네임은 1~8글자(한글/영문/숫자)로 입력해 주세요</p>
                        )}
                    </div>

                    <p className="mt-1 text-xs text-gray-400 leading-5">예: 현, 민지, 팀장님 등</p>
                </section>

                {/* Step 2 */}
                <section className="mb-3">
                    <label className="flex items-center gap-2 text-[14px] font-semibold text-gray-800 mb-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-[12px] font-bold">
                            2
                        </span>
                        모임 성격 선택
                    </label>

                    {/* Vertical List for easier touch */}
                    <div className="flex flex-col gap-3">
                        {CATEGORIES.map((cat) => {
                            const isSelected = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={[
                                        'w-full rounded-2xl border-2 p-4 flex items-center gap-4 text-left transition-all active:scale-[0.98] shadow-sm',
                                        isSelected
                                            ? 'border-black bg-gray-50 ring-1 ring-black'
                                            : 'border-gray-100 bg-white hover:border-gray-300',
                                    ].join(' ')}
                                >
                                    <span className="text-3xl shrink-0">{cat.emoji}</span>
                                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                        <span className="text-base font-bold text-gray-900">
                                            {cat.label}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {cat.desc}
                                        </span>
                                    </div>
                                    {isSelected && (
                                        <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center shrink-0 animate-fade-in">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Guide Text */}
                <div className="mt-2 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-blue-800 flex gap-2 items-start">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                    <p className="text-[11px] leading-[1.4] text-blue-700">
                        <span className="font-bold">TIP</span>: 어색한 사이라면 <span className="font-bold">'아이스브레이킹'</span>이 무난해요!
                    </p>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="shrink-0 border-t border-gray-200 bg-white px-4 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))]">
                <div className="mx-auto w-full max-w-[480px]">
                    {!isValid && (
                        <div className="text-center mb-2">
                            <p className="inline-block px-3 py-1 bg-gray-800 text-white text-xs rounded-full animate-bounce">
                                ☝️ 닉네임을 입력해야 시작할 수 있어요
                            </p>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={handleCreate}
                        disabled={!isValid || isCreating}
                        className={[
                            'w-full h-[52px] rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-lg',
                            isValid
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98]'
                                : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed',
                        ].join(' ')}
                    >
                        {isCreating ? <Loader2 className="animate-spin w-5 h-5" /> : '시작하기'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CreateRoomPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-gray-300" /></div>}>
            <CreateRoomContent />
        </Suspense>
    );
}
