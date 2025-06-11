/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {			animation: {
				'fade-in': 'fadeIn 0.3s ease-out',
				'shake': 'shake 0.5s ease-in-out infinite',
				'slide-up': 'slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' },
				},
				shake: {
					'0%, 100%': { transform: 'translateX(0)' },
					'25%': { transform: 'translateX(-2px)' },
					'75%': { transform: 'translateX(2px)' },
				},
				slideUp: {
					'0%': { 
						transform: 'translateY(100%)', 
						opacity: '0',
						scale: '0.95'
					},
					'100%': { 
						transform: 'translateY(0)', 
						opacity: '1',
						scale: '1'
					},
				},
			},
		},
	},
	plugins: [],
}
