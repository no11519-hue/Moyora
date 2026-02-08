'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

const THEME_CARDS = [
    {
        id: "icebreaking",
        title: "아이스브레이킹",
        desc: "어색한 공기를 3초 만에 깨부수는 가벼운 질문",
        icon: "🧊",
        examples: [
            "학창시절 선생님 몰래 딴짓왕은?",
            "평생 라면 vs 평생 치킨",
            "투명인간이 된다면 가장 먼저 할 일?",
            "무인도에 딱 하나만 가져간다면?"
        ]
    },
    {
        id: "meeting",
        title: "미팅/소개팅",
        desc: "설레는 탐색전, 서로의 호감 확인하기",
        icon: "💘",
        examples: [
            "첫인상이 내 이상형인 사람은?",
            "연락 문제: 잠수 vs 1분마다 톡",
            "기념일 챙기기: 안 챙겨도 됨 vs 필수",
            "가장 선호하는 데이트 스타일은?"
        ]
    },
    {
        id: "drinking",
        title: "술자리/회식",
        desc: "텐션 UP! 매운맛 질문과 밸런스 게임",
        icon: "🍻",
        examples: [
            "100% 1억 vs 50% 100억",
            "취하면 흑역사 만들 것 같은 사람?",
            "다시 태어나면: 재벌 2세 vs 존잘/존예",
            "회식 자리, 끝까지 남는다 vs 도망간다"
        ]
    },
    {
        id: "crewmode",
        title: "팀 빌딩/워크숍",
        desc: "우리 팀 단합력 UP! 훈훈한 마무리",
        icon: "⚡",
        examples: [
            "우리 모임의 숨은 해결사는?",
            "가장 먼저 유튜버로 대박날 사람?",
            "무인도에서도 살아남을 것 같은 멤버?",
            "우리 팀의 분위기 메이커는?"
        ]
    },
    {
        id: "reply7080",
        title: "응답하라 7080",
        desc: "추억의 동창회, 그 시절 우리가 좋아했던...",
        icon: "📼",
        examples: [
            "학창시절 추억은?",
            "첫사랑의 기억",
            "옛날 떡볶이 vs 요즘 마라탕",
            "학창시절 별명은?"
        ]
    },
    {
        id: "bravo_life",
        title: "브라보 마이 라이프",
        desc: "골든에이지 취향, 건강하고 지혜롭게",
        icon: "🌟",
        examples: [
            "버킷리스트 뭐할래?",
            "건강 vs 지혜",
            "가장 기억에 남는 여행지는?",
            "나만의 스트레스 해소법?"
        ]
    },
];

export default function ThemeList() {
    // State to track expanded cards. Map of id -> boolean
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const toggleExpand = (e: React.MouseEvent, id: string) => {
        e.preventDefault(); // Prevent Link navigation when clicking expand
        e.stopPropagation();
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="grid grid-cols-1 gap-3 overflow-y-auto pb-4">
            {THEME_CARDS.map((theme) => (
                <div key={theme.id} className="relative group block">
                    <div className="p-4 rounded-2xl border border-neutral-100 bg-white shadow-sm flex flex-col gap-3 transition-all hover:border-brand/30 hover:shadow-md">

                        {/* Header Part - Clickable Area */}
                        <Link href={`/create?theme=${theme.id}`} className="flex items-start gap-4 w-full">
                            <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center text-2xl shrink-0 group-hover:bg-brand/10 transition-colors">
                                {theme.icon}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex flex-col mb-1">
                                    <span className="font-bold text-[16px] text-neutral-900 group-hover:text-brand transition-colors">
                                        {theme.title}
                                    </span>
                                    {/* 1-line description with ellipsis */}
                                    <span className="text-[12px] text-neutral-500 truncate block w-full max-w-[200px] sm:max-w-full">
                                        {theme.desc}
                                    </span>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-brand transition-colors mt-2" />
                        </Link>

                        {/* Examples Section */}
                        <div className="bg-neutral-50/50 rounded-lg p-3 w-full">
                            <ul className="space-y-1.5">
                                {/* Show first 2 */}
                                {theme.examples.slice(0, 2).map((ex, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[13px] text-neutral-600">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand/40 mt-1.5 shrink-0" />
                                        <span className="leading-snug">{ex}</span>
                                    </li>
                                ))}

                                {/* Hidden/Expanded Items */}
                                {expanded[theme.id] && theme.examples.slice(2).map((ex, i) => (
                                    <li key={`more-${i}`} className="flex items-start gap-2 text-[13px] text-neutral-600 animate-in slide-in-from-top-1 fade-in duration-200">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand/40 mt-1.5 shrink-0" />
                                        <span className="leading-snug">{ex}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Show More Button */}
                            {theme.examples.length > 2 && (
                                <button
                                    type="button"
                                    onClick={(e) => toggleExpand(e, theme.id)}
                                    className="mt-2 text-[12px] font-medium text-neutral-400 hover:text-neutral-600 flex items-center gap-1 transition-colors px-1 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-black/5"
                                    aria-expanded={expanded[theme.id]}
                                    aria-label={expanded[theme.id] ? "예시 접기" : "예시 더 보기"}
                                >
                                    {expanded[theme.id] ? (
                                        <>접기 <ChevronUp className="w-3 h-3" /></>
                                    ) : (
                                        <>더 보기 <ChevronDown className="w-3 h-3" /></>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
