import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="mobile-container flex flex-col min-h-screen bg-white">
            <header className="h-12 flex items-center px-4 border-b border-gray-100">
                <Link href="/" className="p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="font-bold text-gray-900 ml-1">개인정보처리방침</h1>
            </header>
            <div className="p-6 text-center space-y-4 pt-20">
                <h2 className="text-xl font-bold">추후 업데이트 예정입니다</h2>
                <p className="text-gray-500 text-sm">현재 준비 중인 페이지입니다.<br />빠른 시일 내에 찾아뵙겠습니다.</p>
                <div className="pt-4">
                    <a href="mailto:support@moyora.com" className="inline-block px-5 py-2.5 bg-neutral-100 text-neutral-800 font-bold rounded-lg hover:bg-neutral-200 transition-colors">
                        문의하기 (메일)
                    </a>
                </div>
            </div>
        </div>
    );
}
