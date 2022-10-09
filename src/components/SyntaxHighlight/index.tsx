import Highlight, { defaultProps } from "prism-react-renderer"
import React from "react"
import "./code-higlight.css"
import "./code-block.css"

const needExtraImport = ["kotlin", "swift", "php", "java"]
const isBrowser = typeof window !== "undefined"

type Token = Parameters<Highlight["getStyleForToken"]>[0]

function handleHighlightLine(line: Token[]): boolean {
  for (const token of line) {
    if (token.content.includes("highlight-line")) {
      token.content = ""
      return true
    }
  }
  return false
}


export function PrismSyntaxHighlight({ children, className }) {
  const language = className.replace(/language-/gm, "")

  if (needExtraImport.includes(language) && isBrowser) {
    require(`prismjs/components/prism-${language}`)
  }

  return (
    <Highlight {...defaultProps} code={children} language={language} theme={null}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <code className={className} style={style}>
          {tokens.slice(0, -1).map((line, i) => {
            const shouldHighlightLine = handleHighlightLine(line)
            return (
              <div {...getLineProps({ line, key: i })} className={shouldHighlightLine ? "line-highlight" : null}>
                {line.map((token, key) => (
                  <span {...getTokenProps({ token, key })} />
                ))}
              </div>
            )
          })}
        </code>
      )}
    </Highlight>
  )
}
