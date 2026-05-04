/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', md: '1.5rem', lg: '2rem' },
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        paper: 'hsl(var(--paper))',
        ink: 'hsl(var(--ink))',
        'muted-fg': 'hsl(var(--muted-fg))',
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },

        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        display: ['Anton', 'Impact', 'Oswald', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        stamp: '0.22em',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        stamp: '4px 4px 0 0 hsl(var(--ink))',
        'stamp-pressed': '2px 2px 0 0 hsl(var(--ink))',
        'stamp-sm': '2px 2px 0 0 hsl(var(--ink))',
        'stamp-lg': '6px 6px 0 0 hsl(var(--ink))',
        'accent-stamp': '4px 4px 0 0 hsl(var(--accent))',
        glow: '0 0 0 1px hsl(var(--accent)), 0 8px 28px -6px hsl(var(--accent) / 0.45)',
      },
      keyframes: {
        'stamp-in': {
          '0%': { transform: 'scale(1.6) rotate(-3deg)', opacity: '0' },
          '60%': { transform: 'scale(0.95) rotate(-1.5deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-1deg)', opacity: '1' },
        },
        'stamp-impact': {
          '0%': { transform: 'scale(2) rotate(-6deg)', opacity: '0' },
          '50%': { transform: 'scale(0.9) rotate(-1.5deg)', opacity: '1' },
          '70%': { transform: 'scale(1.05) rotate(-2deg)' },
          '100%': { transform: 'scale(1) rotate(-2deg)', opacity: '1' },
        },
        countdown: {
          '0%': { transform: 'scale(1.8)', opacity: '0' },
          '50%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.85)', opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
      },
      animation: {
        'stamp-in': 'stamp-in 280ms cubic-bezier(.2,.7,.2,1) both',
        'stamp-impact': 'stamp-impact 540ms cubic-bezier(.2,.7,.2,1) both',
        countdown: 'countdown 1000ms cubic-bezier(.2,.7,.2,1) both',
        marquee: 'marquee 40s linear infinite',
        'marquee-fast': 'marquee 22s linear infinite',
        scan: 'scan 1.6s linear infinite',
        'fade-up': 'fade-up 320ms cubic-bezier(.2,.7,.2,1) both',
        'pulse-ink': 'pulse-ink 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
