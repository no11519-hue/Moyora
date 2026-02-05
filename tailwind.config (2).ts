
import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#F9FAFB", // 차분한 Off-white (Gray-50)
                foreground: "#111827", // Gray-900
                brand: {
                    DEFAULT: "#FF6B6B", // Coral Pink (Main)
                    hover: "#FA5252",
                    light: "#FFF5F5", // bg-brand-light
                },
                // Alias for backward compatibility
                primary: {
                    DEFAULT: "#FF6B6B",
                    foreground: "#FFFFFF",
                },
                secondary: "#F3F4F6", // Neutral 100
                accent: "#FF6B6B",
                neutral: {
                    50: "#F9FAFB",
                    100: "#F3F4F6",
                    200: "#E5E7EB", // Border
                    300: "#D1D5DB",
                    400: "#9CA3AF", // Disabled text
                    500: "#6B7280", // Sub text
                    600: "#4B5563",
                    700: "#374151",
                    800: "#1F2937",
                    900: "#111827",
                },
            },
            borderRadius: {
                'xl': '12px',
                '2xl': '16px',
                '3xl': '24px',
            },
            boxShadow: {
                'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
                'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'sticky': '0 -4px 12px rgba(0,0,0,0.05)', // 하단 고정 버튼용
            },
            spacing: {
                'safe-bottom': 'env(safe-area-inset-bottom)', // iOS Safe Area
            },
            fontFamily: {
                sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'Helvetica Neue', 'Segoe UI', 'sans-serif'],
            }
        },
    },
    plugins: [],
};
export default config;
