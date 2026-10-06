import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: "media",
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				display: ['Fredoka', 'ui-rounded', 'system-ui', 'sans-serif'],
				sans: ['Nunito', 'ui-rounded', 'system-ui', 'sans-serif']
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				sand: {
					light: 'hsl(var(--sand-light))',
					DEFAULT: 'hsl(var(--sand))',
					dark: 'hsl(var(--sand-dark))'
				},
				glass: {
					DEFAULT: 'hsl(var(--glass))',
					edge: 'hsl(var(--glass-edge))'
				},
				wood: {
					light: 'hsl(var(--wood-light))',
					DEFAULT: 'hsl(var(--wood))',
					dark: 'hsl(var(--wood-dark))'
				},
				blush: 'hsl(var(--blush))'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'sand-stream': {
					from: { strokeDashoffset: '0' },
					to: { strokeDashoffset: '-24' }
				},
				'grain-fall': {
					'0%': { transform: 'translateY(0)', opacity: '0' },
					'20%': { opacity: '1' },
					'80%': { opacity: '1' },
					'100%': { transform: 'translateY(var(--fall, 40px))', opacity: '0' }
				},
				'hourglass-flip-in': {
					'0%': { transform: 'rotate(-180deg) scale(0.85)' },
					'70%': { transform: 'rotate(10deg) scale(1.03)' },
					'100%': { transform: 'rotate(0deg) scale(1)' }
				},
				'idle-bob': {
					'0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
					'25%': { transform: 'translateY(-3px) rotate(-2deg)' },
					'50%': { transform: 'translateY(-6px) rotate(0deg)' },
					'75%': { transform: 'translateY(-3px) rotate(2deg)' }
				},
				'celebrate-pop': {
					'0%, 100%': { transform: 'translateY(0) scale(1)' },
					'40%': { transform: 'translateY(-10px) scale(1.08)' },
					'70%': { transform: 'translateY(0) scale(0.97)' }
				},
				'confetti-burst': {
					'0%': { transform: 'translate(0, 0) rotate(0deg)', opacity: '1' },
					'100%': { transform: 'translate(var(--dx, 0), var(--dy, -80px)) rotate(var(--rot, 540deg))', opacity: '0' }
				},
				'warn-wiggle': {
					'0%, 30%, 100%': { transform: 'rotate(0deg)' },
					'7.5%': { transform: 'rotate(-3deg)' },
					'15%': { transform: 'rotate(3deg)' },
					'22.5%': { transform: 'rotate(-2deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'sand-stream': 'sand-stream 0.6s linear infinite',
				'grain-fall': 'grain-fall 0.9s ease-in infinite',
				'hourglass-flip-in': 'hourglass-flip-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both',
				'idle-bob': 'idle-bob 3.2s ease-in-out infinite',
				'celebrate-pop': 'celebrate-pop 0.9s ease-in-out infinite',
				'confetti-burst': 'confetti-burst 1.4s ease-out forwards',
				'warn-wiggle': 'warn-wiggle 2s ease-in-out infinite'
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
