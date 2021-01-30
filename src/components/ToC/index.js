import React, { useEffect, useMemo } from "react"
import { useActiveHash } from "./use-active-hash"
import "./style.css"
import { link } from "pngquant-bin"

// https://stackoverflow.com/questions/60833907/gatsby-syncing-the-table-of-contents-with-the-page-scroll-and-style-the-active-l
export default function TableOfContents({ items }) {
  // console.log(html)
  const isSSR = typeof window === "undefined"
  let targetedIds = useMemo(() => {
    return []
    // if (isSSR) return []
    // var dummyDOM = document.createElement("html")
    // dummyDOM.innerHTML = html
    // const justAnchors = dummyDOM.querySelectorAll(`a`)

    // let val = []
    // justAnchors.forEach(a => {
    //   val.push(a.hash.replace("#", ""))
    // })

    // return val
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
    <div className="ToCs">
      <ul>
        {items.map(i => builditem(i))}
      </ul>
    </div>
  )
}

function builditem(item) {
  return <li>
    <a href={item.url}>{item.title}</a>
    {item.items && <ul>{item.items.map(i => builditem(i))}</ul>}
  </li>
}