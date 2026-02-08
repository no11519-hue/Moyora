
import { Metadata } from 'next';
import CreateContent from './CreateContent';

export const metadata: Metadata = {
    title: '방 만들기 - Moyora',
    description: '주제별 대화방을 만들고 QR코드로 친구들을 초대하세요.',
};

export default function CreatePage() {
    return <CreateContent />;
}
