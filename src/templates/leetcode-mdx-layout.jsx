import React from "react"
import { MDXProvider } from "@mdx-js/react"

const myThematicBreak = () => <p style={{ fontFamily: "JetBrains Mono, monospace", textAlign: "center" }}>***</p>
const components = { thematicBreak: myThematicBreak, hr: myThematicBreak }

const LeetCodeMdxLayout = ({ children }) => <MDXProvider components={components}>{children}</MDXProvider>

export default LeetCodeMdxLayout
