import React, { useEffect, useMemo } from "react"
import { useActiveHash } from "./use-active-hash"
import "./style.css"

// https://stackoverflow.com/questions/60833907/gatsby-syncing-the-table-of-contents-with-the-page-scroll-and-style-the-active-l
export default function TableOfContents({ html }) {
  const isSSR = typeof window === "undefined"
  let targetedIds = useMemo(() => {
    if (isSSR) return []
    var dummyDOM = document.createElement("html")
    dummyDOM.innerHTML = html
    const justAnchors = dummyDOM.querySelectorAll(`a`)

    let val = []
    justAnchors.forEach(a => {
      val.push(a.hash.replace("#", ""))
    })

    return val
  }, [])

  const activeHash = useActiveHash(targetedIds)

  useEffect(() => {
    if (isSSR) return
    const ToClinks = document.querySelectorAll(`.ToCs a`)

    ToClinks.forEach(a => {
      a.classList.remove("isActive")
    })

    const selector = `.ToCs a[href="${"#" + encodeURI(activeHash)}"]`
    const activeLink = document.querySelectorAll(selector)

    if (activeLink.length) {
      activeLink[0].classList.add("isActive")
    }
  }, [activeHash])

  return (
    <div
      className="ToCs" dangerouslySetInnerHTML={{ __html: html }} />
  )
}