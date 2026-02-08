import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="mobile-container flex flex-col min-h-screen bg-white">
            <header className="h-12 flex items-center px-4 border-b border-gray-100">
                <Link href="/" className="p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="font-bold text-gray-900 ml-1">문의하기</h1>
            </header>
            <div className="p-6 text-center space-y-4 pt-20">
                <h2 className="text-xl font-bold">무엇을 도와드릴까요?</h2>
                <p className="text-gray-500 text-sm">서비스 이용 중 불편한 점이나<br />제안하고 싶은 점이 있다면 언제든 알려주세요.</p>
                <div className="pt-4">
                    <a href="mailto:support@moyora.com" className="inline-block px-5 py-2.5 bg-neutral-900 text-white font-bold rounded-lg hover:bg-neutral-700 transition-colors">
                        메일 보내기
                    </a>
                </div>
                <p className="text-xs text-neutral-400 mt-4">support@moyora.com</p>
            </div>
        </div>
    );
}
