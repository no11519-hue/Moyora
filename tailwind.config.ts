
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
                background: "#FDFBF7", // Warm Cream
                foreground: "#1F2937",
                primary: {
                    DEFAULT: "#FF6B6B", // Coral Pink
                    foreground: "#FFFFFF",
                    hover: "#FA5252",
                },
                secondary: {
                    DEFAULT: "#FF9F43", // Warm Orange (Sunny Yellowish Orange)
                    foreground: "#FFFFFF",
                },
                accent: {
                    DEFAULT: "#FFD93D", // Sunny Yellow for highlights if needed
                    foreground: "#1F2937",
                },
                surface: "#FFFFFF", // Card background
                border: "#E5E7EB",
            },
            borderRadius: {
                lg: "1rem",
                xl: "1.5rem",
                '2xl': "2rem",
                '3xl': "2.5rem", // More rounded
            },
            boxShadow: {
                soft: "0 10px 40px -10px rgba(0,0,0,0.08)",
                glow: "0 0 20px rgba(255, 107, 107, 0.3)",
                card: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                'card-hover': "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            },
            animation: {
                'bounce-slow': 'bounce 3s infinite',
                'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'slide-up': 'slideUp 0.3s ease-out forwards',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
};
export default config;
