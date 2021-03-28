import Typography from "typography"
import Wordpress2016 from "typography-theme-wordpress-2016"
import './global.css'

const SourceHanSerif = "source-han-serif-sc"
const SourceHanSans = "source-han-sans-simplified-c"

Wordpress2016.overrideThemeStyles = ({ rhythm }, _, styles) => {
  // palt: 半宽标点（SourceHanSerif）
  // onum: 老式数字（SourceSerif）
  styles.body.fontFeatureSettings += `, "palt", "dlig", "onum"`
  styles.body.textRendering = "optimizelegibility"

  // Fix scrolling main content when mobile menu is open.
  delete styles.html.overflowY

  return {
    // larger line-height for english-language blog post
    "html[lang=en] main": { lineHeight: "1.5", fontSize: `18px` },

    // inline styles
    // cite: { fontFamily: ["Zilla Slab", "serif"].join(","), fontSize: "1.125em" },
    // ".dark strong": { fontFamily: ["Roboto Slab", SourceHanSans, "sans-serif"].join(",") },
    "a.gatsby-resp-image-link": { boxShadow: `none`, },

    // block styles
    ".subtitle": { fontFamily: ["Zilla Slab", "serif"].join(","), fontSize: "1.125em" },
    h1: { fontFamily: ["Roboto Slab", SourceHanSerif, "sans-serif"].join(",") },
    blockquote: { fontFamily: ["source-serif-4", "Zilla Slab", SourceHanSerif, "serif"].join(",") },
    ".custom-block, .gatsby-highlight": { marginBottom: rhythm(1) },

    // code blocks
    code: { fontFamily: `"JetBrains Mono", Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace !important` },
    // smaller size for inline code
    ":not(pre) > code": { fontStyle: "normal", fontSize: "0.8em!important" },
  }
}

Wordpress2016.googleFonts = [
  // { name: "Noto Serif SC", styles: [400, 900] },
  // { name: "Noto Sans SC", styles: [900] },
]

Wordpress2016.bodyFontFamily = [
  // "merriweather", SourceHanSerif, "Georgia", "serif"
  // "lora", SourceHanSerif, "Georgia", "serif"
  "source-serif-4", SourceHanSerif, "Georgia", "serif"
]

Wordpress2016.headerFontFamily = [
  "Roboto Slab", SourceHanSans, "sans-serif"
]

const typography = new Typography(Wordpress2016)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
