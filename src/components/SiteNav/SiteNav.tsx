import React from "react"
import { Link } from "gatsby"
import "./site-nav.scss"

const data = [
  { link: "/", title: "Home" },
  { link: "/leetcode", title: "LeetCode" },
  { link: "/friends", title: "Friends" },
]

const isActive = (location, link): boolean => {
  if (link == "/" && location.pathname !== "/") return false
  return (location?.pathname || location)?.includes(link.substr(1))
}

const SiteNav = (props) => <nav {...props} className="site-nav">
  {
    data.map((it, index) =>
      <span key={it.link}>
        <Link to={it.link}
              className={isActive(props.location, it.link) ? "active" : ""}>{it.title.toUpperCase()}
        </Link>
        {index === data.length - 1 ? undefined : " | "}
      </span>,
    )
  }
</nav>

export default SiteNav