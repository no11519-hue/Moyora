'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const THEME_CARDS = [
    {
        id: "icebreaking",
        title: "아이스브레이킹",
        desc: "어색한 공기를 3초 만에 깨부수는 가벼운 질문",
        icon: "🧊",
    },
    {
        id: "meeting",
        title: "미팅/소개팅",
        desc: "설레는 탐색전, 서로의 호감 확인하기",
        icon: "💘",
    },
    {
        id: "drinking",
        title: "술자리/회식",
        desc: "텐션 UP! 매운맛 질문과 밸런스 게임",
        icon: "🍻",
    },
    {
        id: "reply7080",
        title: "응답하라 7080",
        desc: "추억의 동창회, 그 시절 우리가 좋아했던...",
        icon: "📼",
    },
];

export default function ThemeList() {
    return (
        <div className="grid grid-cols-1 gap-3 overflow-y-auto pb-4">
            {THEME_CARDS.map((theme) => (
                <div key={theme.id} className="relative group block">
                    <div className="p-4 rounded-2xl border border-neutral-100 bg-white shadow-sm flex items-center gap-3 transition-all hover:border-brand/30 hover:shadow-md">
                        {/* Clickable Area */}
                        <Link href={`/create?theme=${theme.id}`} className="flex items-center gap-4 w-full">
                            <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center text-2xl shrink-0 group-hover:bg-brand/10 transition-colors">
                                {theme.icon}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex flex-col">
                                    <span className="font-bold text-[16px] text-neutral-900 group-hover:text-brand transition-colors">
                                        {theme.title}
                                    </span>
                                    {/* 1-line description */}
                                    <span className="text-[12px] text-neutral-500 truncate block w-full">
                                        {theme.desc}
                                    </span>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-brand transition-colors" />
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}

