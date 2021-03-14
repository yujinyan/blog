import PropTypes from "prop-types"
import React from "react"
import useScrollSpy from "./scroll-spy-hook"
import "./toc.scss"

TableOfContents.propTypes = {
  data: PropTypes.object.isRequired,
  linkClicked: PropTypes.func,
}

export default function TableOfContents({ data, linkClicked }) {
  const urls = getUrls(data.items)
  const isActive = useScrollSpy(urls)

  if (urls.length === 0) return null

  return <div
    className="ToCs"
    onClick={
      (evt) => {
        if (linkClicked && evt.target.tagName === "A") {
          linkClicked()
        }
      }
    }
  >
    <ul>
      {data.items.map(item => buildItem(item, isActive))}
    </ul>
  </div>
}

function buildItem(item, isActive) {
  const hasChildren = item.items
  const a = (
    <a href={item.url}
       className={isActive(item.url.replace("#", "")) ? "isActive" : ""}
    >{item.title}</a>
  )

  return (
    <li key={item.title}>
      {hasChildren ? <p>{a}</p> : a}
      {
        hasChildren &&
        <ul>{item.items.map(i => buildItem(i, isActive))}</ul>
      }
    </li>
  )
}

function getUrls(items) {
  const result = []
  if (!items) return result

  function walk(items) {
    items.forEach(it => {
      result.push(it.url.replace("#", ""))
      it.items && walk(it.items)
    })
  }

  walk(items)
  return result
}
