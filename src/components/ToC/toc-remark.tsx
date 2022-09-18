import React, { useEffect, useMemo } from "react"
import { useActiveHash } from "./use-active-hash"


type TableOfContentsProps = {
  html: string,
  linkClicked?: () => void
}

// https://stackoverflow.com/questions/60833907/gatsby-syncing-the-table-of-contents-with-the-page-scroll-and-style-the-active-l
export default function TableOfContents({ html, linkClicked }: TableOfContentsProps) {
  const isSSR = typeof window === "undefined"
  let targetedIds = useMemo(() => {
    if (isSSR) return []
    const dummyDOM = document.createElement("html")
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
      className="ToCs"
      dangerouslySetInnerHTML={{ __html: html }}
      onClick={
        (evt) => {
          if (linkClicked && (evt.target as Element).tagName === "A") {
            linkClicked()
          }
        }
      }
    />
  )
}
