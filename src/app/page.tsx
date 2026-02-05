
import Link from 'next/link';
import { ArrowRight, Sparkles, MessageCircle, Heart, Beer, Users, Gamepad2 } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center px-5 py-6 relative overflow-hidden bg-[#FDFBF7]">
      {/* Background Decor: Festive & Organic */}
      <div className="absolute top-[-10%] right-[-20%] w-72 h-72 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute top-[30%] left-[-20%] w-56 h-56 bg-gradient-to-tr from-accent/30 to-primary/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-[-10%] right-[10%] w-80 h-80 bg-gradient-to-t from-secondary/10 to-transparent rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '4s' }} />

      {/* Header */}
      <header className="w-full flex justify-center pb-2 z-10 animate-slide-up">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" strokeWidth={2.5} />
          <h1 className="text-xl font-black tracking-tight text-gray-800">
            모여라 <span className="text-primary">Moyora</span>
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm gap-8 z-10 mt-[-20px]">

        {/* Hero Text */}
        <div className="text-center space-y-4 animate-slide-up">
          <span className="inline-block px-4 py-1.5 bg-white border-2 border-primary/10 rounded-full text-xs font-bold text-primary shadow-sm mb-2">
            🤗 모두가 즐거운 연결
          </span>
          <h2 className="text-[34px] font-black text-gray-900 leading-[1.2]">
            어색한 침묵은 끝!<br />
            <span className="relative inline-block z-10">
              <span className="absolute inset-x-0 bottom-1 h-3 bg-secondary/30 -z-10 rounded-sm"></span>
              3초면 텐션 UP
            </span>
          </h2>
          <p className="text-gray-500 text-base font-medium leading-relaxed px-2 text-balance">
            설치도, 회원가입도 필요 없어요.<br />
            지금 바로 <span className="font-bold text-gray-700">QR 코드</span>로 시작하세요!
          </p>
        </div>

        {/* CTA Button */}
        <div className="w-full px-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Link href="/create" className="w-full group relative block">
            {/* Glow Effect */}
            <div className="absolute top-4 left-0 w-full h-full bg-primary/30 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition duration-500"></div>

            <button className="relative w-full py-5 bg-gradient-to-r from-primary to-secondary text-white rounded-3xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 text-xl font-black group-hover:scale-[1.02] active:scale-[0.98] transition-all border-b-4 border-black/10 active:border-b-0 active:translate-y-1">
              <span>지금 방 만들기</span>
              <div className="bg-white/20 p-1.5 rounded-full">
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
              </div>
            </button>
          </Link>
          <p className="text-[11px] font-medium text-gray-400 text-center mt-4">
            ✨ 100% 무료 • 무제한 플레이
          </p>
        </div>
      </div>

      {/* Bottom Section: Popular Themes */}
      <div className="w-full max-w-sm mt-auto pb-6 z-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex justify-between items-end px-1 mb-4">
          <h3 className="text-sm font-extrabold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-accent fill-accent" />
            인기 테마 미리보기
          </h3>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          </div>
        </div>

        {/* 가로 스크롤 카드 */}
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide snap-x">
          {THEMES.map((theme, i) => (
            <div key={i} className="min-w-[150px] p-5 bg-white rounded-3xl border border-gray-100 shadow-card hover:shadow-card-hover flex flex-col gap-3 snap-center active:scale-95 transition-all">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme.colorBg} mb-1 shadow-sm`}>
                {theme.icon}
              </div>
              <div>
                <span className="block font-black text-gray-800 text-lg leading-tight mb-1">{theme.title}</span>
                <span className="block text-xs font-semibold text-gray-400">{theme.desc}</span>
              </div>
            </div>
          ))}
          {/* 여백용 더미 */}
          <div className="min-w-[5px]"></div>
        </div>
      </div>
    </main>
  );
}

const THEMES = [
  {
    title: "두근두근\n소개팅",
    desc: "첫인상 1위는?",
    icon: <Heart className="w-6 h-6 text-primary fill-primary/20" />,
    colorBg: "bg-red-50",
  },
  {
    title: "왁자지껄\n술자리",
    desc: "벌칙 당첨은?",
    icon: <Beer className="w-6 h-6 text-amber-600 fill-amber-600/20" />,
    colorBg: "bg-amber-50",
  },
  {
    title: "으샤으샤\n워크숍",
    desc: "법카 찬스!",
    icon: <MessageCircle className="w-6 h-6 text-blue-600 fill-blue-600/20" />,
    colorBg: "bg-blue-50",
  },
  {
    title: "랜덤게임\n플레이",
    desc: "무엇이 나올까?",
    icon: <Gamepad2 className="w-6 h-6 text-purple-600 fill-purple-600/20" />,
    colorBg: "bg-purple-50",
  },
];
