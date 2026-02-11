
import Link from 'next/link';
import { ArrowRight, Zap, Sparkles, PartyPopper } from 'lucide-react';
import ThemeList from '@/components/ThemeList';

export default function Home() {
  return (
    <main className="mobile-container h-screen flex flex-col relative bg-gray-50 overflow-hidden">

      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-accent-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="h-14 flex items-center justify-between px-5 shrink-0 glass z-10 relative border-b border-white/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow">
            <PartyPopper className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-neutral-900">Moyora</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col px-5 pt-4 pb-3 overflow-hidden relative z-[1]">

        {/* Hero Section */}
        <section className="flex flex-col items-center text-center space-y-3 mb-4 shrink-0">
          {/* Feature Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-100 text-amber-700 text-[11px] font-bold tracking-wide shadow-xs">
            <Zap className="w-3.5 h-3.5" fill="currentColor" /> 다운로드 X · 로그인 X · 100% 무료
          </span>

          {/* Headline */}
          <h1 className="text-[26px] font-extrabold text-neutral-900 leading-tight">
            어색한 침묵? <br />
            <span className="text-gradient-brand">QR 찍고 3초컷으로 해결!</span>
          </h1>

          <p className="text-neutral-500 text-sm leading-relaxed break-keep max-w-[260px]">
            처음 만난 자리, <br />
            대화가 자연스럽게 이어지는 아이스브레이커
          </p>

          {/* CTA Button */}
          <div className="w-full max-w-[300px] mt-1 flex flex-col items-center gap-3">
            <Link href="/create" className="w-full group">
              <button className="btn-shine w-full py-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-full font-bold text-[16px] flex items-center justify-center gap-2 shadow-lg hover:shadow-glow-lg active:scale-95 transition-all duration-300 animate-glow-pulse">
                지금 방 만들기
                <ArrowRight className="w-5 h-5 opacity-80 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            {/* 3 Step Guide */}
            <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-0.5 text-[11px] font-semibold text-neutral-500 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl w-full shadow-xs border border-white/50">
              <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-brand-100 text-brand text-[9px] font-black flex items-center justify-center">1</span> 방 만들기</span>
              <span className="text-neutral-200">→</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-brand-100 text-brand text-[9px] font-black flex items-center justify-center">2</span> QR 공유</span>
              <span className="text-neutral-200">→</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-brand-100 text-brand text-[9px] font-black flex items-center justify-center">3</span> 질문 시작</span>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-[10px] font-bold text-neutral-400 mt-1 tracking-wide">
            <span className="flex items-center gap-0.5">🔒 광고 없음</span>
            <span>·</span>
            <span>💬 대화 내용 저장 안 함</span>
            <span>·</span>
            <span>🛡️ 개인정보 안전</span>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent mb-4 shrink-0" />

        {/* Popular Themes */}
        <section className="flex-1 min-h-0 shrink-0 flex flex-col">
          <div className="flex items-center gap-2 mb-3 shrink-0">
            <Sparkles className="w-5 h-5 text-accent fill-accent-200" />
            <h2 className="text-[16px] font-extrabold text-neutral-800">인기 테마</h2>
            <span className="ml-auto text-[11px] text-brand font-semibold">전체보기 →</span>
          </div>

          {/* Theme List Component */}
          <ThemeList />
        </section>

        {/* Footer */}
        <footer className="mt-auto pt-4 border-t border-neutral-100/50 text-center pb-8 shrink-0">
          <p className="text-[10px] text-neutral-400 mb-3">
            © 2026 Moyora. A simple icebreaker service.
          </p>
          <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 text-[11px] text-neutral-500 font-medium">
            <Link href="/terms" className="px-2 py-1 hover:text-brand hover:bg-brand-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-200">
              이용약관
            </Link>
            <Link href="/privacy" className="px-2 py-1 hover:text-brand hover:bg-brand-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-200">
              개인정보처리방침
            </Link>
            <Link href="/contact" className="px-2 py-1 hover:text-brand hover:bg-brand-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-200">
              문의하기
            </Link>
          </div>
          <p className="mt-2 text-[9px] text-neutral-300">
            대화 내용은 서버에 영구 저장하지 않습니다.
          </p>
        </footer>

      </div>
    </main>
  );
}
