import React from "react"
import { graphql, Link, useStaticQuery } from "gatsby"
import DarkModeToggle from "./DarkModeToggle"
import SiteNav from "./SiteNav"

import { rhythm } from "../utils/typography"
import AdobeFont from "@/components/AdobeFont"

const Layout = ({
                  location,
                  title,
                  children,
                  aside,
                  darkModeToggleOverride,
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
      <h1 className="text-5xl -ml-2">
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
      <h3 className="text-2xl">
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
      <AdobeFont />
      <SiteNav location={location} className="mb-8" />
      <header className="flex mb-8">
        {header}
        {darkModeToggleOverride ||
        <DarkModeToggle className="absolute right-4 top-8" />}
      </header>
      <main>
        {children}
      </main>
      {aside}
      <footer className="font-subtitle mt-8">
        © {new Date().getFullYear()} yujinyan.me
      </footer>
    </div>
  )
}

export default Layout
