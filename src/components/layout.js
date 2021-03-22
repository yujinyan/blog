import React from "react"
import { graphql, Link, useStaticQuery } from "gatsby"
import DarkModeToggle from "./DarkModeToggle"
import SiteNav from "./SiteNav"

import { rhythm, scale } from "../utils/typography"

const Layout = ({
  location,
  title,
  children,
  aside,
  darkModeToggleOverride
}) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const data = useStaticQuery(graphql`
    query HeaderQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  let header

  if (location.pathname === rootPath) {
    header = (
      <h1
        style={{
          ...scale(1.25),
          marginBottom: rhythm(1.5),
          marginTop: 0,
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            textDecoration: `none`,
            color: `inherit`,
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h1>
    )
  } else {
    header = (
      <h3
        style={{ marginTop: 0 }}
      >
        <Link
          style={{
            boxShadow: `none`,
            textDecoration: `none`,
            color: `inherit`,
          }}
          to={`/`}
        >
          {title || data.site.siteMetadata.title}
        </Link>
      </h3>
    )
  }
  return (
    <div
      style={{
        marginLeft: `auto`,
        marginRight: `auto`,
        maxWidth: rhythm(24),
        padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        transition: "color 0.2s ease-out, background 0.2s ease-out",
        color: "var(--textNormal)",
      }}
    >
      <SiteNav location={location} style={{ marginBottom: rhythm(1) }} />
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {header}
        {darkModeToggleOverride ||
        <DarkModeToggle style={{ position: "absolute", right: rhythm(1), top: rhythm(1.25) }} />}
      </header>
      <main>
        {children}
      </main>
      {aside}
      <footer>© {new Date().getFullYear()} yujinyan.me</footer>
    </div>
  )
}

export default Layout
