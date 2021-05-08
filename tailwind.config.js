const SourceHanSerif = "source-han-serif-sc"
const colors = require('tailwindcss/colors')

module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      primary: "var(--primary)",
      body: "var(--body)",
      caption: "var(--caption)",
      gray: colors.coolGray
    },
    fontFamily: {
      "serif": ["source-serif-4", SourceHanSerif, "Georgia", "serif",],
      "subtitle": ["Zilla Slab", "Georgia", "serif"],
      "mono": `"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;`
    },
    extend: {
      typography: {
        DEFAULT: {
          css: {
            color: "var(--body)",
            maxWidth: null,
            "h1, h2, h3, h4, h5": {
              color: "var(--body)"
            },
            a: {
              color: "var(--primary)",
              textDecoration: "none"
            },
            "code": null,
            "code::before": null,
            "code::after": null,
            "blockquote p:first-of-type::before": null,
            "blockquote p:last-of-type::after": null
          }
        },
        dark: {
          css: {
            strong: {
              color: colors.coolGray["50"]
            }
          }
        }
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
}
