import React from "react"

export const UtterancesComments = (props) => (
  <div className={props.className}>
    <h2 className="text-3xl" style={{ marginBottom: 0, marginTop: 0 }}>Comments</h2>
    <p
      className="caption text-sm">
      You can also comment on <a
      className="underline"
      href={`https://github.com/yujinyan/blog/issues/${props.issueId}`}
      target="_blank"
      rel="noopener noreferrer"
    >this GitHub issue</a> directly.</p>
    <section
      ref={elem => {
        if (!elem || elem.childElementCount > 0) {
          return
        }
        const scriptElem = document.createElement("script")
        scriptElem.src = "https://utteranc.es/client.js"
        scriptElem.async = true
        scriptElem.crossOrigin = "anonymous"
        scriptElem.setAttribute("repo", "yujinyan/blog")
        scriptElem.setAttribute("issue-number", props.issueId)
        scriptElem.setAttribute("theme", "preferred-color-scheme")
        elem.appendChild(scriptElem)
      }}
    />
  </div>
)