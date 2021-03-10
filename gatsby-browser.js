// custom typefaces
// import "typeface-montserrat"
// import "typeface-merriweather"
import typography from "./src/utils/typography"

import "prismjs/themes/prism-tomorrow.css"
import "@fontsource/roboto-slab/900.css"
import "@fontsource/jetbrains-mono/400.css"
import "@fontsource/zilla-slab/400-italic.css"
import "@fontsource/zilla-slab/400.css"


// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}