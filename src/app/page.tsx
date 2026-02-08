
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
            <Zap className="w-3 h-3" fill="currentColor" /> 앱 설치 없이 3초컷
          </span>

          <h1 className="text-2xl font-bold text-neutral-900 leading-tight">
            어색한 침묵? <br />
            <span className="text-brand">QR 찍고 3초컷으로 해결!</span>
          </h1>

          <p className="text-neutral-500 text-sm leading-snug">
            다운로드 X·로그인 X·100% 무료.<br />
            지금 바로 분위기를 띄워보세요. 🚀
          </p>

          {/* CTA Compact */}
          <Link href="/create" className="w-full max-w-[280px] mt-0.5 group">
            <button className="w-full py-2.5 bg-neutral-900 text-white rounded-full font-bold text-[15px] flex items-center justify-center gap-2 shadow-md group-active:scale-95 transition-all">
              지금 방 만들기
              <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>

          <div className="w-full max-w-[320px] text-[11px] text-neutral-500 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-center sm:gap-2">
            <span className="inline-flex items-center justify-center gap-1 rounded-full bg-neutral-50 px-2 py-1">1) 방 만들기</span>
            <span className="hidden sm:inline text-neutral-300">→</span>
            <span className="inline-flex items-center justify-center gap-1 rounded-full bg-neutral-50 px-2 py-1">2) QR 공유</span>
            <span className="hidden sm:inline text-neutral-300">→</span>
            <span className="inline-flex items-center justify-center gap-1 rounded-full bg-neutral-50 px-2 py-1">3) 질문 시작</span>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-neutral-400 mt-2 tracking-wide">
            <span>완전 무료</span>
            <span>·</span>
            <span>광고 없음</span>
            <span>·</span>
            <span>개인정보 저장 안 함</span>
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

          <div className="grid grid-cols-1 gap-3 overflow-y-auto pb-4">
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
                    <p className="text-[12px] text-neutral-500 leading-snug">
                      {theme.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer with Policy Links */}
        <footer className="mt-auto pt-4 border-t border-neutral-100 text-center pb-8">
          <p className="text-[10px] text-neutral-400 mb-3">
            © 2026 Moyora. A simple icebreaker service.
          </p>
          <div className="flex justify-center flex-wrap gap-4 text-[11px] text-neutral-500 font-medium">
            <Link
              href="/terms"
              className="min-h-[44px] flex items-center px-2 rounded-full hover:text-neutral-900 hover:bg-neutral-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            >
              이용약관
            </Link>
            <Link
              href="/privacy"
              className="min-h-[44px] flex items-center px-2 rounded-full hover:text-neutral-900 hover:bg-neutral-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            >
              개인정보처리방침
            </Link>
            <a
              href="mailto:support@moyora.com"
              className="min-h-[44px] flex items-center px-2 rounded-full hover:text-neutral-900 hover:bg-neutral-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            >
              문의하기
            </a>
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
    description: "첫 만남에 부담 없이 시작하는 가벼운 질문."
  },
  {
    id: "meeting",
    title: "미팅/소개팅",
    sub: "설레는 탐색전",
    icon: "💘",
    description: "호감과 가치관을 자연스럽게 알아봐요."
  },
  {
    id: "drinking",
    title: "술자리/회식",
    sub: "텐션 UP!",
    icon: "🍻",
    description: "분위기를 올려주는 밸런스와 벌칙 게임."
  },
  {
    id: "crewmode",
    title: "팀 빌딩/워크숍",
    sub: "훈훈한 마무리",
    icon: "⚡",
    description: "팀 분위기와 협업 감각을 높이는 질문."
  },
  {
    id: "reply7080",
    title: "응답하라 7080",
    sub: "추억의 동창회",
    icon: "📼",
    description: "추억 토크와 공감 포인트를 함께 나눠요."
  },
  {
    id: "bravo_life",
    title: "브라보 마이 라이프",
    sub: "골든에이지 취향",
    icon: "🌟",
    description: "취향과 일상을 이야기하는 따뜻한 질문."
  },
];
