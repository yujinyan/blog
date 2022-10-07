import Highlight, { defaultProps } from "prism-react-renderer"
import React from "react"
import "./code-higlight.css"

const needExtraImport = ["kotlin", "swift", "php", "java"]
const isBrowser = typeof window !== "undefined"


export const PrismSyntaxHighlight = ({ children, className }) => {
  const language = className.replace(/language-/gm, "")

  if (needExtraImport.includes(language) && isBrowser) {
    require(`prismjs/components/prism-${language}`)
  }

  return (
    <Highlight {...defaultProps} code={children} language={language} theme={null}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <code className={className} style={style}>
          {tokens.slice(0, -1).map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </code>
      )}
    </Highlight>
  )
}
