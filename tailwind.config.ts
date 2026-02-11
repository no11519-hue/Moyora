
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
                background: "#F8F7FF", // Soft violet-tinted off-white
                foreground: "#111827",
                brand: {
                    DEFAULT: "#7C3AED", // Violet-600
                    hover: "#6D28D9",   // Violet-700
                    light: "#F5F3FF",   // Violet-50
                    50: "#F5F3FF",
                    100: "#EDE9FE",
                    200: "#DDD6FE",
                    300: "#C4B5FD",
                    400: "#A78BFA",
                    500: "#8B5CF6",
                    600: "#7C3AED",
                    700: "#6D28D9",
                    800: "#5B21B6",
                    900: "#4C1D95",
                },
                accent: {
                    DEFAULT: "#F59E0B", // Amber-500
                    light: "#FEF3C7",   // Amber-100
                    dark: "#D97706",    // Amber-600
                    50: "#FFFBEB",
                    100: "#FEF3C7",
                    200: "#FDE68A",
                    300: "#FCD34D",
                    400: "#FBBF24",
                    500: "#F59E0B",
                },
                // Alias for backward compatibility
                primary: {
                    DEFAULT: "#7C3AED",
                    foreground: "#FFFFFF",
                },
                secondary: "#F3F4F6",
                neutral: {
                    50: "#F9FAFB",
                    100: "#F3F4F6",
                    200: "#E5E7EB",
                    300: "#D1D5DB",
                    400: "#9CA3AF",
                    500: "#6B7280",
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
                'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                'glow': '0 0 20px rgba(124, 58, 237, 0.15)',
                'glow-lg': '0 0 40px rgba(124, 58, 237, 0.2)',
                'sticky': '0 -4px 12px rgba(0,0,0,0.05)',
                'card': '0 2px 8px rgba(124, 58, 237, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)',
                'card-hover': '0 8px 25px rgba(124, 58, 237, 0.15), 0 3px 10px rgba(0, 0, 0, 0.06)',
            },
            spacing: {
                'safe-bottom': 'env(safe-area-inset-bottom)',
            },
            fontFamily: {
                sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'Helvetica Neue', 'Segoe UI', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 3s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-6px)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'bounce-gentle': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-4px)' },
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.15)' },
                    '50%': { boxShadow: '0 0 30px rgba(124, 58, 237, 0.3)' },
                },
            },
        },
    },
    plugins: [],
};
export default config;
