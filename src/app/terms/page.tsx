import Link from 'next/link';

export default function TermsPage() {
    return (
        <main className="mobile-container min-h-[100dvh] bg-white px-6 py-8">
            <Link
                href="/"
                className="text-sm text-neutral-500 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            >
                ← 홈으로
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-neutral-900">이용약관</h1>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                모요라는 별도의 회원가입 없이 방을 만들고 QR을 공유해 게임을 진행할 수 있습니다.
                서비스 이용 시 타인에게 불쾌감을 줄 수 있는 콘텐츠는 삼가 주세요.
            </p>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                자세한 약관은 정식 고지 시 업데이트될 예정이며, 문의 사항은 하단 문의하기를 통해 전달해 주세요.
            </p>
        </main>
    );
}
