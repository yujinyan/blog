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
    "a.gatsby-resp-image-link": { boxShadow: `none`, },
    h1: { fontFamily: ["Roboto Slab", SourceHanSans, "sans-serif"].join(",") },
    blockquote: { fontFamily: ["source-serif-4", "Zilla Slab", SourceHanSerif, "serif"].join(",") },
    ":not(pre) > code": { fontStyle: "normal", fontSize: "0.8em!important" },
    cite: { fontFamily: ["Zilla Slab", "serif"].join(","), fontSize: "1.125em" },
    ".custom-block, .gatsby-highlight": { marginBottom: rhythm(1) },
    ".subtitle": { fontFamily: ["Zilla Slab", "serif"].join(","), fontSize: "1.125em" },
    ".dark strong": { fontFamily: ["Roboto Slab", SourceHanSans, "sans-serif"].join(",") },
    "html[lang=en]": { lineHeight: "1.5", fontSize: `18px` }
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
