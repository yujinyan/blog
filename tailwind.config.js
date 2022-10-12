const SourceHanSerif = "source-han-serif-sc"
const SourceHanSans = "source-han-sans-simplified-c"
const colors = require("tailwindcss/colors")
const monoFonts = (fontName) => `"${fontName}", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;`


module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    colors: {
      primary: colors.sky,
      secondary: colors.pink,
      body: "var(--body)",
      caption: "var(--caption)",
      hr: "var(--hr)",
      sky: colors.sky,
      gray: colors.gray,
      red: colors.red,
      green: colors.green,
      yellow: colors.yellow,
      background: "var(--bg)",
      on: {
        background: "var(--body)"
      }
    },
    fontFamily: {
      "serif": `"source-serif-4", ${SourceHanSerif}, "Georgia", "serif"`,
      "subtitle": `"Zilla Slab", "Georgia", "serif"`,
      "display": `"Roboto Slab", ${SourceHanSans}, "sans-serif"`,
      "mono": monoFonts("JetBrains Mono"),
    },
    extend: {
      transitionProperty: {
        colors: "color, background-color",
      },
      spacing: {
        horizontal: "1.3125rem",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: "var(--body)",
            maxWidth: null,
            "h1, h2, h3, h4, h5": {
              color: "var(--body)",
            },
            a: {
              color: "var(--primary)",
              textDecoration: "none",
            },
            // "code": null,
            // "code::before": null,
            // "code::after": null,
            "blockquote p:first-of-type::before": null,
            "blockquote p:last-of-type::after": null,
            "hr": null,
          },
        },
        dark: {
          css: {
            strong: {
              color: colors.gray["50"],
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
}

