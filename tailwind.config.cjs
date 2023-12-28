const SourceHanSerif = "source-han-serif-sc"
const defaultTheme = require("tailwindcss/defaultConfig").theme
const colors = require("tailwindcss/colors")


/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: ['class', '[data-theme="dark"]'],
	daisyui: {
		themes: [
			{
				light: require("daisyui/src/theming/themes")["cupcake"],
				dark: require("daisyui/src/theming/themes")["dracula"]
			}
		],
		darkTheme: "dark",
		base: true,
		styled: true,
		themeRoot: ":root"

	},
	plugins: [require("@tailwindcss/typography"), require("daisyui")],
	theme: {
		colors: {
			divider: "oklch(var(--bc) / 20%)",
			body: "var(--body)",
			caption: "var(--caption)",
			hr: "var(--hr)",
			red: colors.red,
			white: colors.white,
			emerald: colors.emerald,
			transparent: colors.transparent,
			slate: colors.slate,
			rose: colors.rose,
		},
		fontFamily: {
			"serif": [`"source-serif-4", ${SourceHanSerif}`, defaultTheme.fontFamily.serif],
			"subtitle": `"Zilla Slab", "Georgia", "serif"`,
			"display": ["Literata", ...defaultTheme.fontFamily.serif],
			"heading": ["Roboto Slab", ...defaultTheme.fontFamily.sans],
			"mono": ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
			"sans": defaultTheme.fontFamily.sans
		},
		extend: {
			typography: ({ theme }) => ({
				DEFAULT: {
					css: {
						'a': { // define in global.css
							textDecoration: false,
							color: null,
						},
						'a:active, a:hover': {
							boxShadow: '0 1px 0 0 currentColor'
						},
						"blockquote": {
							"quotes": `"“" "”" "“" "”"`,
							"border-left-width": 0,
						},
						// "blockquote p:first-of-type::before": { content: '“' },
						"blockquote p:last-of-type::after": { content: 'none' },
						"code": {
 							// workaround: 2px 8px added by daisyui later, 
							// we use !important to override. 
							// There may be better ways to do this.
							padding: "2px 0!important"
						}
					}
				}
			})
		},
	},
}
