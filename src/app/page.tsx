
import Link from 'next/link';
import { ArrowRight, Zap, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="mobile-container h-screen flex flex-col relative bg-white overflow-hidden">

      {/* Compact Header */}
      <header className="h-12 flex items-center justify-between px-5 shrink-0 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center gap-1.5 opacity-90">
          <span className="text-xl">🤗</span>
          <span className="font-bold text-base tracking-tight text-neutral-900">Moyora</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col px-5 pt-3 pb-4 overflow-hidden">

        {/* 1. Hero Compact */}
        <section className="flex flex-col items-center text-center space-y-3 mb-4 shrink-0">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold tracking-wide uppercase">
            <Zap className="w-3 h-3" fill="currentColor" /> 3초 컷 아이스브레이킹
          </span>

          <h1 className="text-2xl font-bold text-neutral-900 leading-tight">
            QR 찍고,<br />
            <span className="text-brand">바로 대화 시작!</span>
          </h1>

          <p className="text-neutral-500 text-sm leading-snug">
            설치 X, 로그인 X, 100% 무료.<br />
            지금 바로 분위기를 띄워보세요.
          </p>

          {/* CTA Compact */}
          <Link href="/create" className="w-full max-w-[280px] mt-1 group">
            <button className="w-full py-3 bg-neutral-900 text-white rounded-full font-bold text-[15px] flex items-center justify-center gap-2 shadow-md group-active:scale-95 transition-all">
              지금 방 만들기
              <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-neutral-100 mb-4 shrink-0"></div>

        {/* 2. Popular Themes (2x2 Grid, No Scroll) */}
        <section className="flex-1 min-h-0 shrink-0">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-4 h-4 text-brand fill-brand/20" />
            <h2 className="text-[15px] font-bold text-neutral-800">인기 테마</h2>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {THEME_CARDS.map((theme, i) => (
              <div key={i} className="p-3 rounded-2xl border border-neutral-100 bg-neutral-50/50 flex flex-col items-center text-center gap-1.5 active:bg-neutral-100 transition-colors">
                <div className="text-2xl">{theme.icon}</div>
                <div>
                  <span className="block font-bold text-[13px] text-neutral-900">{theme.title}</span>
                  <span className="block text-[10px] text-neutral-400 mt-0.5">{theme.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <p className="text-[10px] text-neutral-300 text-center mt-4 shrink-0">
          © 2026 Moyora. Simple Ice-breaking Service.
        </p>

      </div>
    </main>
  );
}

const THEME_CARDS = [
  { title: "아이스브레이킹", sub: "어색함 해제", icon: "🧊" },
  { title: "소개팅/미팅", sub: "설레는 탐색전", icon: "💕" },
  { title: "회식/술자리", sub: "텐션 UP!", icon: "🍻" },
  { title: "팀 워크숍", sub: "훈훈한 마무리", icon: "📢" },
];
