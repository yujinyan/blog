import Typography from "typography"
import Wordpress2016 from "typography-theme-wordpress-2016"
import './global.css'

Wordpress2016.overrideThemeStyles = ({ rhythm }) => {
  return {
    "a.gatsby-resp-image-link": { boxShadow: `none`, },
    h1: { fontFamily: ["Roboto Slab", "Noto Sans SC", "sans-serif"].join(",") },
    blockquote: { fontFamily: ["Zilla Slab", "serif"].join(",") },
    cite: { fontFamily: ["Zilla Slab", "serif"].join(","), fontSize: "1.125em" },
    ".custom-block": { marginBottom: rhythm(1) },
    ".subtitle": { fontFamily: ["Zilla Slab", "serif"].join(","), fontSize: "1.125em" },
  }
}

Wordpress2016.googleFonts = [
  { name: "Noto Serif SC", styles: [400, 900] },
  { name: "Noto Sans SC", styles: [900] },
]

Wordpress2016.bodyFontFamily = [
  "Noto Serif SC", "Georgia", "serif"
]

Wordpress2016.headerFontFamily = [
  "Roboto Slab", "Noto Sans SC", "sans-serif"
]

const typography = new Typography(Wordpress2016)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
