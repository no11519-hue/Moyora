import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '방 만들기 | Moyora',
    description: '모요라에서 방을 만들고 QR을 공유해 바로 아이스브레이킹을 시작하세요.',
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
    return children;
}
