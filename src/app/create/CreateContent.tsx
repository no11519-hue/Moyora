'use client';

import { useMemo, useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Check, Loader2, Info, Sparkles } from 'lucide-react';

const GENERAL_CATEGORIES = [
    { id: 'icebreaking', label: '아이스브레이킹', emoji: '🧊', desc: '어색한 공기를 깨는 가벼운 질문!', gradient: 'from-sky-400/10 to-violet-400/10' },
    { id: 'meeting', label: '미팅/소개팅', emoji: '💘', desc: '상대방의 마음을 알아보는 설렘 가득 질문', gradient: 'from-pink-400/10 to-rose-400/10' },
    { id: 'drinking', label: '술자리 게임', emoji: '🍻', desc: '분위기 띄우는 화끈한 매운맛 질문', gradient: 'from-amber-400/10 to-orange-400/10' },
    { id: 'crewmode', label: '팀 빌딩/워크숍', emoji: '⚡', desc: '우리 팀 단합력 UP! 칭찬과 격려', gradient: 'from-emerald-400/10 to-teal-400/10' },
] as const;

const SENIOR_CATEGORIES = [
    { id: 'reply7080', label: '응답하라 7080', emoji: '📼', desc: '추억의 동창회/동호회 토크 (공통게임X)', gradient: 'from-amber-300/10 to-yellow-400/10' },
    { id: 'bravo_life', label: '브라보 마이 라이프', emoji: '🌟', desc: '골든에이지 취향/건강/여행 토크 (공통게임X)', gradient: 'from-orange-300/10 to-red-300/10' },
] as const;

const ALL_CATEGORIES = [...GENERAL_CATEGORIES, ...SENIOR_CATEGORIES];

type CategoryId = (typeof ALL_CATEGORIES)[number]['id'];

function CreateForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(() => {
        if (typeof window === 'undefined') return 'icebreaking';
        const theme = searchParams.get('theme');
        if (theme === 'dating') return 'meeting';
        if (theme === 'retro7080') return 'reply7080';
        if (theme === 'goldenlife') return 'bravo_life';

        const isValid = ALL_CATEGORIES.some(c => c.id === theme);
        return isValid ? (theme as CategoryId) : 'icebreaking';
    });

    const [nickname, setNickname] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const trimmedNickname = useMemo(() => nickname.trim(), [nickname]);
    const nicknameRegex = /^[가-힣a-zA-Z0-9 ]+$/;
    const isNicknameValid = (trimmedNickname.length >= 1 && trimmedNickname.length <= 8 && nicknameRegex.test(trimmedNickname));
    const isValid = Boolean(selectedCategory) && isNicknameValid;

    const isSenior = (id: string) => SENIOR_CATEGORIES.some(c => c.id === id);

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

    if (!isClient) {
        return <LoadingFallback />;
    }

    const renderCategoryCard = (cat: typeof ALL_CATEGORIES[number], index: number) => {
        const isSelected = selectedCategory === cat.id;
        const senior = isSenior(cat.id);

        return (
            <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{ animationDelay: `${index * 60}ms` }}
                className={[
                    'w-full min-h-[76px] rounded-2xl border-2 p-4 flex items-center gap-4 text-left transition-all duration-300 active:scale-[0.98]',
                    isSelected
                        ? senior ? 'card-senior card-selected' : 'card-selected'
                        : senior
                            ? 'card-senior hover:shadow-md'
                            : 'border-gray-100 bg-white hover:border-brand-200 hover:shadow-md',
                ].join(' ')}
            >
                {/* Icon */}
                <div className={`
                    w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.gradient}
                    flex items-center justify-center text-3xl shrink-0
                    transition-transform duration-300
                    ${isSelected ? 'scale-110' : ''}
                `}>
                    {cat.emoji}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className={`text-base font-bold transition-colors ${isSelected ? (senior ? 'text-amber-700' : 'text-brand') : 'text-gray-700'}`}>
                        {cat.label}
                    </span>
                    <span className="text-xs text-gray-400">
                        {cat.desc}
                    </span>
                </div>

                {/* Check */}
                {isSelected && (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 animate-in zoom-in duration-200 shadow-sm ${senior ? 'bg-gradient-to-br from-amber-400 to-amber-500' : 'bg-gradient-to-br from-brand-500 to-brand-700'}`}>
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                )}
            </button>
        );
    };

    return (
        <div className="mobile-container w-full max-w-[480px] mx-auto min-h-[100dvh] flex flex-col bg-gray-50">

            {/* Header */}
            <header className="h-14 flex items-center gap-2 px-4 glass border-b border-white/30 shrink-0 sticky top-0 z-10">
                <Link
                    href="/"
                    className="p-2 -ml-2 text-gray-500 hover:text-brand rounded-full hover:bg-brand-50 transition-all"
                    aria-label="홈으로"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-[17px] font-extrabold text-gray-900">방 만들기</h1>
            </header>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-5 pt-4 pb-3">
                {/* Step 1 - Nickname */}
                <section className="mb-6">
                    <label className="flex items-center gap-2.5 text-[15px] font-bold text-gray-800 mb-3">
                        <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white text-[12px] font-bold shadow-sm">
                            1
                        </span>
                        진행자 닉네임
                    </label>

                    <div className="flex flex-col gap-1.5">
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => {
                                setNickname(e.target.value);
                            }}
                            placeholder="MC 닉네임 정하기 (1~8글자)"
                            className={`w-full h-[60px] px-5 rounded-2xl bg-white border-2 text-lg font-bold text-gray-900 placeholder:text-gray-400 focus:bg-white outline-none transition-all shadow-sm ${nickname.length > 0 && !isNicknameValid
                                ? 'border-red-300 focus:border-red-500 bg-red-50'
                                : 'border-gray-100 focus:border-brand focus:shadow-glow'
                                }`}
                            autoFocus
                            inputMode="text"
                            autoCapitalize="off"
                            autoCorrect="off"
                            spellCheck={false}
                            maxLength={8}
                        />

                        <div className="min-h-[20px] px-1">
                            {nickname.length > 0 && !isNicknameValid ? (
                                <p className="text-red-500 text-xs font-medium animate-pulse">🚨 닉네임은 1~8글자(한글/영문/숫자)로 입력해 주세요</p>
                            ) : (
                                <p className="text-xs text-gray-400">예: 현, 민지, 팀장님 등</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Step 2 - Categories */}
                <section className="mb-3">
                    <label className="flex items-center gap-2.5 text-[15px] font-bold text-gray-800 mb-3">
                        <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white text-[12px] font-bold shadow-sm">
                            2
                        </span>
                        모임 성격 선택
                    </label>

                    {/* General Themes */}
                    <div className="flex flex-col gap-3">
                        {GENERAL_CATEGORIES.map((cat, idx) => renderCategoryCard(cat, idx))}
                    </div>

                    {/* Senior Section Divider */}
                    <div className="mt-6 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
                        </div>
                        <p className="text-[13px] font-bold text-amber-700 flex items-center gap-1.5">
                            👨‍👩‍👧‍👦 가족/동창회 추천
                            <span className="tip-badge">큰 글씨 모드</span>
                        </p>
                        <p className="text-[11px] text-amber-600/70 mt-0.5">시니어 분들에게 맞춤화된 더 크고 읽기 쉬운 화면</p>
                    </div>

                    {/* Senior Themes */}
                    <div className="flex flex-col gap-3">
                        {SENIOR_CATEGORIES.map((cat, idx) => renderCategoryCard(cat, GENERAL_CATEGORIES.length + idx))}
                    </div>
                </section>

                {/* TIP Section */}
                <div className="mt-5 mb-2 p-4 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100/50 border border-brand-200/30 flex gap-3 items-start shadow-xs">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center shrink-0 shadow-sm">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-[12px] leading-[1.6] text-brand-800 break-keep">
                            <span className="tip-badge mr-1">TIP</span>
                            어떤 걸 고를지 고민된다면 무난한 <span className="font-bold text-brand">&apos;아이스브레이킹&apos;</span>을 추천해요!
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="shrink-0 border-t border-gray-100/50 glass px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-20">
                <div className="mx-auto w-full max-w-[480px]">
                    {!isValid && (
                        <div className="text-center mb-2">
                            <p className="inline-block px-3 py-1 bg-brand text-white text-[11px] font-bold rounded-full animate-bounce-gentle shadow-glow">
                                ☝️ 닉네임을 입력해야 시작할 수 있어요
                            </p>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={handleCreate}
                        disabled={!isValid || isCreating}
                        className={[
                            'btn-shine w-full h-[56px] rounded-full font-bold text-[16px] flex items-center justify-center gap-2 transition-all duration-300',
                            isValid
                                ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:shadow-glow-lg active:scale-[0.97] shadow-lg'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
                        ].join(' ')}
                    >
                        {isCreating ? <Loader2 className="animate-spin w-5 h-5" /> : '🎉 시작하기'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="mobile-container w-full max-w-[480px] mx-auto min-h-screen flex flex-col bg-gray-50">
            <header className="h-14 flex items-center gap-2 px-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
                <div className="w-24 h-5 bg-gray-100 rounded animate-pulse ml-1" />
            </header>
            <div className="p-5 space-y-6">
                <div className="space-y-3">
                    <div className="w-20 h-5 bg-gray-100 rounded animate-pulse" />
                    <div className="w-full h-16 bg-gray-50 rounded-2xl animate-pulse" />
                </div>
                <div className="space-y-3">
                    <div className="w-20 h-5 bg-gray-100 rounded animate-pulse" />
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-full h-20 bg-gray-50 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CreateContent() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <CreateForm />
        </Suspense>
    );
}
