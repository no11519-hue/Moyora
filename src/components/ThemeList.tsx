'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const THEME_CARDS = [
    {
        id: "icebreaking",
        title: "아이스브레이킹",
        desc: "어색한 공기를 3초 만에 깨부수는 가벼운 질문",
        icon: "🧊",
        gradient: "from-sky-400/10 to-violet-400/10",
    },
    {
        id: "meeting",
        title: "미팅/소개팅",
        desc: "설레는 탐색전, 서로의 호감 확인하기",
        icon: "💘",
        gradient: "from-pink-400/10 to-rose-400/10",
    },
    {
        id: "drinking",
        title: "술자리/회식",
        desc: "텐션 UP! 매운맛 질문과 밸런스 게임",
        icon: "🍻",
        gradient: "from-amber-400/10 to-orange-400/10",
    },
    {
        id: "reply7080",
        title: "응답하라 7080",
        desc: "추억의 동창회, 그 시절 우리가 좋아했던...",
        icon: "📼",
        gradient: "from-amber-300/10 to-yellow-400/10",
        isSenior: true,
    },
];

export default function ThemeList() {
    return (
        <div className="grid grid-cols-1 gap-3 overflow-y-auto pb-4">
            {THEME_CARDS.map((theme, index) => (
                <Link
                    href={`/create?theme=${theme.id}`}
                    key={theme.id}
                    className="block group"
                    style={{ animationDelay: `${index * 80}ms` }}
                >
                    <div className={`
                        relative p-4 rounded-2xl border-2 bg-white
                        flex items-center gap-4
                        transition-all duration-300 ease-out
                        hover:shadow-card-hover hover:-translate-y-0.5
                        active:scale-[0.98]
                        ${theme.isSenior
                            ? 'border-orange-200/60 hover:border-orange-300'
                            : 'border-gray-100 hover:border-brand-300'
                        }
                        shadow-card
                    `}>
                        {/* Icon with gradient background */}
                        <div className={`
                            w-14 h-14 rounded-2xl bg-gradient-to-br ${theme.gradient}
                            flex items-center justify-center text-3xl shrink-0
                            group-hover:scale-110 transition-transform duration-300
                        `}>
                            {theme.icon}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0 text-left">
                            <span className="font-bold text-[16px] text-neutral-900 group-hover:text-brand transition-colors block">
                                {theme.title}
                            </span>
                            <span className="text-[12px] text-neutral-500 truncate block w-full mt-0.5">
                                {theme.desc}
                            </span>
                        </div>

                        {/* Arrow */}
                        <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-brand-50 flex items-center justify-center shrink-0 transition-all duration-300">
                            <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-brand group-hover:translate-x-0.5 transition-all duration-300" />
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
