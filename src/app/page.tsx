
import Link from 'next/link';
import { ArrowRight, Zap, Sparkles } from 'lucide-react';
import ThemeList from '@/components/ThemeList';

export default function Home() {
  return (
    <main className="mobile-container h-screen flex flex-col relative bg-white overflow-hidden">

      {/* Compact Header */}
      <header className="h-12 flex items-center justify-between px-5 shrink-0 bg-white/90 backdrop-blur-sm z-10 relative">
        <div className="flex items-center gap-1.5 opacity-90">
          <span className="text-xl">🤗</span>
          <span className="font-bold text-base tracking-tight text-neutral-900">Moyora</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col px-5 pt-2 pb-3 overflow-hidden">

        {/* 1. Hero Compact */}
        <section className="flex flex-col items-center text-center space-y-2 mb-3 shrink-0">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold tracking-wide uppercase">
            <Zap className="w-3 h-3" fill="currentColor" /> 다운로드 X·로그인 X·100% 무료
          </span>

          <h1 className="text-2xl font-bold text-neutral-900 leading-tight">
            어색한 침묵? <br />
            <span className="text-brand">QR 찍고 3초컷으로 해결!</span>
          </h1>

          <p className="text-neutral-500 text-sm leading-snug break-keep">
            처음 만난 자리, <br />
            대화가 자연스럽게 이어지는 아이스브레이커
          </p>

          {/* CTA Group */}
          <div className="w-full max-w-[280px] mt-0.5 flex flex-col items-center gap-3">
            <Link href="/create" className="w-full group">
              <button className="w-full py-2.5 bg-neutral-900 text-white rounded-full font-bold text-[15px] flex items-center justify-center gap-2 shadow-md group-active:scale-95 transition-all">
                지금 방 만들기
                <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            {/* 3 Step Guide */}
            <div className="flex flex-wrap justify-center items-center gap-x-1 gap-y-0.5 text-[11px] font-medium text-neutral-500 bg-neutral-50 px-3 py-1.5 rounded-lg w-full">
              <span>1) 방 만들기</span>
              <span className="text-neutral-300">·</span>
              <span>2) QR 공유</span>
              <span className="text-neutral-300">·</span>
              <span>3) 질문 시작</span>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="flex flex-wrap justify-center items-center gap-x-1.5 gap-y-1 text-[10px] font-bold text-neutral-400 mt-1 tracking-wide">
            <span>광고 없음</span>
            <span>·</span>
            <span>대화 내용 저장 안 함</span>
            <span>·</span>
            <span>개인정보 저장 안 함</span>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-neutral-100 mb-3 shrink-0"></div>

        {/* 2. Popular Themes */}
        <section className="flex-1 min-h-0 shrink-0 flex flex-col">
          <div className="flex items-center gap-1.5 mb-2 shrink-0">
            <Sparkles className="w-4 h-4 text-brand fill-brand/20" />
            <h2 className="text-[15px] font-bold text-neutral-800">인기 테마</h2>
          </div>

          {/* Theme List Component */}
          <ThemeList />
        </section>

        {/* Footer with Policy Links */}
        <footer className="mt-auto pt-4 border-t border-neutral-100 text-center pb-8 shrink-0">
          <p className="text-[10px] text-neutral-400 mb-3">
            © 2026 Moyora. A simple icebreaker service.
          </p>
          <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 text-[11px] text-neutral-500 font-medium">
            <Link href="/terms" className="px-2 py-1 hover:text-neutral-900 hover:bg-neutral-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-200">
              이용약관
            </Link>
            <Link href="/privacy" className="px-2 py-1 hover:text-neutral-900 hover:bg-neutral-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-200">
              개인정보처리방침
            </Link>
            <Link href="/contact" className="px-2 py-1 hover:text-neutral-900 hover:bg-neutral-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-200">
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
