
import Link from 'next/link';
import { ArrowRight, Zap, Users, Sparkles, MessageSquare, Heart, Beer, Smile } from 'lucide-react';

export default function Home() {
  return (
    <main className="mobile-container flex flex-col relative overflow-hidden">

      {/* 1. Header (Simple) */}
      <header className="h-14 flex items-center justify-between px-5 border-b border-neutral-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">🤗</span>
          <span className="font-bold text-lg tracking-tight text-neutral-900">Moyora</span>
        </div>
        <Link href="#" className="text-xs font-medium text-neutral-500 hover:text-brand transition-colors">
          데모 체험
        </Link>
      </header>

      <div className="flex-1 flex flex-col pb-10">

        {/* 2. Hero Section */}
        <section className="px-6 pt-10 pb-8 flex flex-col gap-6 text-center items-center">

          <div className="space-y-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-light text-brand text-[11px] font-bold tracking-wide uppercase">
              <Zap className="w-3 h-3" fill="currentColor" /> 3초면 아이스브레이킹 끝
            </span>
            <h1 className="text-[28px] leading-[1.3] font-semibold text-neutral-900 text-balance">
              QR 찍고,<br />
              대화가 시작됩니다.
            </h1>
            <p className="text-neutral-500 text-[15px] leading-relaxed max-w-[280px] mx-auto text-balance">
              어색한 침묵은 그만.<br />
              설치 없이, 로그인 없이 바로 시작하세요.
            </p>
          </div>

          {/* Feature Chips */}
          <div className="flex gap-2 justify-center flex-wrap">
            {["⚡ 설치 없음", "🙅‍♂️ 로그인 없음", "🚀 1분 준비"].map((txt, i) => (
              <span key={i} className="px-2.5 py-1 bg-neutral-100 rounded-md text-xs text-neutral-600 font-medium">
                {txt}
              </span>
            ))}
          </div>

          {/* 3. Primary CTA (Above Fold) */}
          <div className="w-full mt-2">
            <Link href="/create" className="block w-full">
              <button className="w-full h-[52px] bg-brand hover:bg-brand-hover text-white rounded-xl font-bold text-[17px] flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]">
                지금 방 만들기
                <ArrowRight className="w-5 h-5 opacity-90" />
              </button>
            </Link>
            <div className="mt-4 flex justify-center">
              <button className="text-[13px] text-neutral-400 font-medium border-b border-transparent hover:border-neutral-300 transition-all flex items-center gap-1">
                어떻게 작동하나요? <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </section>

        <div className="h-2 bg-neutral-50 border-t border-b border-neutral-100/50"></div>

        {/* 4. Popular Themes (Horizontal Scroll) */}
        <section className="py-8 pl-6">
          <div className="flex items-center gap-2 mb-4 pr-6">
            <Sparkles className="w-4 h-4 text-brand" />
            <h2 className="text-lg font-bold text-neutral-900">이런 모임, 어때요?</h2>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-6 pr-6 -ml-1 pl-1 scrollbar-hide snap-x snap-mandatory">
            {THEME_CARDS.map((theme, i) => (
              <div key={i} className="min-w-[160px] p-5 rounded-2xl border border-neutral-200 bg-white shadow-xs flex flex-col gap-3 snap-start active:bg-neutral-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${theme.bg}`}>
                  {theme.icon}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-neutral-900">{theme.title}</span>
                  <span className="text-xs text-neutral-500">{theme.sub}</span>
                </div>
                <div className="mt-2 pt-3 border-t border-neutral-100">
                  <span className="text-[11px] text-neutral-400 bg-neutral-50 px-2 py-1 rounded inline-block line-clamp-1">
                    " {theme.q} "
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. How it works (Simple Steps) */}
        <section className="px-6 py-2 pb-12">
          <h3 className="text-sm font-bold text-neutral-400 uppercase mb-6 tracking-wider">How to play</h3>
          <div className="space-y-6 border-l-2 border-neutral-100 ml-2 pl-6 relative">
            <Step
              num={1} title="방 만들기"
              desc="주제만 고르면 끝. 10초면 충분해요."
            />
            <Step
              num={2} title="QR 코드 공유"
              desc="참가자는 카메라만 켜면 입장 완료."
            />
            <Step
              num={3} title="실시간 플레이"
              desc="질문에 투표하고 결과를 함께 즐겨요."
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto py-8 text-center border-t border-neutral-100 bg-neutral-50">
          <p className="text-[11px] text-neutral-400">© 2026 Moyora. All rights reserved.</p>
        </footer>

      </div>
    </main>
  );
}

function Step({ num, title, desc }: { num: number, title: string, desc: string }) {
  return (
    <div className="relative">
      <div className="absolute -left-[33px] top-0 w-3.5 h-3.5 rounded-full bg-neutral-200 border-2 border-white ring-1 ring-neutral-100"></div>
      <h4 className="font-bold text-neutral-900 text-[15px]">{title}</h4>
      <p className="text-sm text-neutral-500 mt-0.5">{desc}</p>
    </div>
  )
}

const THEME_CARDS = [
  { title: "아이스브레이킹", sub: "어색함 해제", bg: "bg-blue-50", icon: "🧊", q: "학창시절 별명은?" },
  { title: "소개팅/미팅", sub: "설레는 탐색전", bg: "bg-pink-50", icon: "💕", q: "첫인상 1위는?" },
  { title: "회식/술자리", sub: "텐션 UP!", bg: "bg-orange-50", icon: "🍻", q: "이 사람 주사는?" },
  { title: "팀 워크숍", sub: "훈훈한 마무리", bg: "bg-green-50", icon: "💼", q: "숨은 해결사는?" },
];
