import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            keyframes: {
                float: {
                    "0%": {
                        transform: "translateY(0) translateX(0) rotate(0deg) scale(1)",
                        opacity: "0.5"
                    },
                    "25%": {
                        transform: "translateY(-15px) translateX(15px) rotate(5deg) scale(1.05)",
                        opacity: "0.8"
                    },
                    "50%": {
                        transform: "translateY(10px) translateX(-10px) rotate(-5deg) scale(0.95)",
                        opacity: "0.6"
                    },
                    "75%": {
                        transform: "translateY(-8px) translateX(8px) rotate(3deg) scale(1.02)",
                        opacity: "0.7"
                    },
                    "100%": {
                        transform: "translateY(0) translateX(0) rotate(0deg) scale(1)",
                        opacity: "0.5"
                    }
                },
            },
            animation: {
                float: "float 20s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
        },
    },
    plugins: [tailwindAnimate],
};

export default config; 
