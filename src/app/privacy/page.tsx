import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <main className="mobile-container min-h-[100dvh] bg-white px-6 py-8">
            <Link
                href="/"
                className="text-sm text-neutral-500 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            >
                ← 홈으로
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-neutral-900">개인정보처리방침</h1>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                모요라는 방 진행에 필요한 최소한의 정보만 사용하며, 대화 내용은 서버에 영구 저장하지 않습니다.
                입력한 닉네임은 방 진행을 위한 표시 목적으로만 사용됩니다.
            </p>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                개인정보 관련 문의는 언제든지 문의하기 메일로 알려 주세요.
            </p>
        </main>
    );
}
