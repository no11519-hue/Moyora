import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

export const alt = 'Moyora - 3초 컷 아이스브레이킹';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #4f46e5, #9333ea)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 20
                    }}
                >
                    {/* Simple Logo Shape */}
                    <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 80 V 20 L 50 50 L 80 20 V 80" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div style={{ fontSize: 90, fontWeight: 900, marginBottom: 20, letterSpacing: '-0.05em' }}>
                    Moyora
                </div>
                <div style={{ fontSize: 40, fontWeight: 700, opacity: 0.9 }}>
                    QR 찍고 바로 시작하는 아이스브레이킹
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
