
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

      <div className="flex-1 flex flex-col px-5 pt-2 pb-3 overflow-hidden">

        {/* 1. Hero Compact */}
        <section className="flex flex-col items-center text-center space-y-2 mb-3 shrink-0">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold tracking-wide uppercase">
            <Zap className="w-3 h-3" fill="currentColor" /> 앱 설치 없이 3초 컷
          </span>

          <h1 className="text-2xl font-bold text-neutral-900 leading-tight">
            어색한 침묵,<br />
            <span className="text-brand">QR 찍고 3초면 해결!</span>
          </h1>

          <p className="text-neutral-500 text-sm leading-snug">
            다운로드 X, 로그인 X, 100% 무료.<br />
            지금 바로 분위기를 띄워보세요. 🚀
          </p>

          {/* CTA Compact */}
          <Link href="/create" className="w-full max-w-[280px] mt-0.5 group">
            <button className="w-full py-2.5 bg-neutral-900 text-white rounded-full font-bold text-[15px] flex items-center justify-center gap-2 shadow-md group-active:scale-95 transition-all">
              지금 방 만들기
              <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>

          {/* Trust Badge */}
          <div className="flex items-center gap-3 text-[10px] text-neutral-400 mt-2">
            <span className="flex items-center gap-1">💸 완전 무료</span>
            <span className="w-px h-2 bg-neutral-200"></span>
            <span className="flex items-center gap-1">🚫 광고 없음</span>
            <span className="w-px h-2 bg-neutral-200"></span>
            <span className="flex items-center gap-1">🔒 정보 저장 X</span>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-neutral-100 mb-3 shrink-0"></div>

        {/* 2. Popular Themes */}
        <section className="flex-1 min-h-0 shrink-0">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-4 h-4 text-brand fill-brand/20" />
            <h2 className="text-[15px] font-bold text-neutral-800">인기 테마</h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {THEME_CARDS.map((theme, i) => (
              <Link
                key={i}
                href={`/create?theme=${theme.id}`}
                className="block group"
              >
                <div className="p-4 rounded-2xl border border-neutral-100 bg-white shadow-sm flex items-start gap-4 active:scale-[0.99] transition-all hover:border-brand/30 hover:shadow-md">
                  <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center text-2xl shrink-0 group-hover:bg-brand/10 transition-colors">
                    {theme.icon}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[16px] text-neutral-900 group-hover:text-brand transition-colors">{theme.title}</span>
                      <span className="text-[11px] text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded-full group-hover:bg-brand/5 group-hover:text-brand/60 transition-colors">
                        {theme.sub} <ArrowRight className="w-3 h-3 inline-block ml-0.5" />
                      </span>
                    </div>

                    {/* Example Questions Preview */}
                    <div className="space-y-1">
                      {theme.examples.map((ex, j) => (
                        <div key={j} className="flex items-center gap-1.5 opacity-60">
                          <div className="w-1 h-1 rounded-full bg-neutral-400 shrink-0" />
                          <span className="text-[12px] text-neutral-600 truncate">{ex}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer with Policy Links */}
        <footer className="mt-4 pt-4 border-t border-neutral-100 text-center pb-4">
          <p className="text-[10px] text-neutral-400 mb-2">
            © 2026 Moyora. Simple Ice-breaking Service.
          </p>
          <div className="flex justify-center gap-3 text-[10px] text-neutral-400">
            <span className="cursor-not-allowed opacity-50">이용약관</span>
            <span className="w-px h-2 bg-neutral-200 my-auto"></span>
            <span className="cursor-not-allowed opacity-50">개인정보처리방침</span>
            <span className="w-px h-2 bg-neutral-200 my-auto"></span>
            <a href="mailto:support@moyora.com" className="hover:text-neutral-600 transition-colors">문의하기</a>
          </div>
          <p className="mt-2 text-[9px] text-neutral-300">
            모요라는 대화 내용을 서버에 영구 저장하지 않습니다.
          </p>
        </footer>

      </div>
    </main>
  );
}

const THEME_CARDS = [
  {
    id: "icebreaking",
    title: "아이스브레이킹",
    sub: "어색함 해제",
    icon: "🧊",
    examples: ["학창시절 선생님 몰래 딴짓왕은?", "평생 라면 vs 평생 치킨"]
  },
  {
    id: "dating",
    title: "미팅/소개팅",
    sub: "설레는 탐색전",
    icon: "💕",
    examples: ["첫인상이 내 이상형인 사람은?", "연락 문제: 잠수 vs 1분마다 톡"]
  },
  {
    id: "drinking",
    title: "술자리/회식",
    sub: "텐션 UP!",
    icon: "🍻",
    examples: ["100% 1억 vs 50% 100억", "취하면 흑역사 만들 것 같은 사람?"]
  },
  {
    id: "crewmode",
    title: "크루모드(동호회)",
    sub: "훈훈한 마무리",
    icon: "🔥",
    examples: ["우리 모임의 숨은 해결사는?", "가장 먼저 유튜버로 대박날 사람?"]
  },
];
