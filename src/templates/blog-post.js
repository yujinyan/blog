import React, { useState } from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/Bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm, scale } from "../utils/typography"
import { TranslateInfo, TranslateMark } from "../components/translate"
import ToC from "../components/ToC"
import Fab from "../components/Fab"
import { UtterancesComments } from "../components/utterances"
import GithubCorner from "../components/GithubCorner"
import "./blog-post.scss"
import DarkModeToggle from "../components/DarkModeToggle"
import Helmet from "react-helmet"
import "katex/dist/katex.min.css"
import { MDXRenderer } from "gatsby-plugin-mdx"
import MyMdxLayout from "@/templates/my-mdx-layout"

const BlogPostTemplate = ({ data, pageContext, location }) => {
  const post = data.mdx
  const siteTitle = data.site.siteMetadata.title
  const { previous, next } = pageContext
  const [menuIsOpen, setMenuOpen] = useState(false)

  const githubUrl = post.frontmatter.issueId ?
    `https://github.com/yujinyan/blog/issues/${post.frontmatter.issueId}` :
    "https://github.com/yujinyan/blog"

  const darkModeToggle = <DarkModeToggle
    className="fixed-on-desktop"
    style={{
      zIndex: 50,
      position: `${menuIsOpen ? "fixed" : "absolute"}`,
      right: rhythm(1),
      top: rhythm(1.25),
    }}
  />

  return (
    <Layout
      location={location}
      title={siteTitle}
      aside={
        // should make child sibling of main scrollable content
        // https://stackoverflow.com/a/20028988/6627776 
        post.tableOfContents &&
        <aside className={`sidebar ${menuIsOpen ? "" : "hide"}`}>
          <GithubCorner className="hide-on-desktop" url={githubUrl} />
          <ToC
            data={post.tableOfContents}
            linkClicked={() => setMenuOpen(false)} />
        </aside>
      }
      darkModeToggleOverride={darkModeToggle}
    >
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
      />
      {/* Currently, blog posts are either in English or Simplified Han */}
      <Helmet htmlAttributes={{ lang: post.frontmatter.english ? "en" : "zh-cmn-Hans" }} />
      <article>
        <header>
          <h1
            style={{
              marginTop: rhythm(1),
              marginBottom: 0,
            }}
          >
            {post.frontmatter.translate && <TranslateMark />}
            <span style={{ verticalAlign: "middle" }}>
              {post.frontmatter.title}
            </span>
          </h1>
          <p
            style={{
              ...scale(-1 / 5),
              display: `block`,
              marginBottom: rhythm(1),
              fontFamily: "Georgia, serif",
            }}
          >
            {post.frontmatter.date}
          </p>
        </header>
        {post.frontmatter.translate &&
        TranslateInfo(post.frontmatter.translate)}
        {
          <MyMdxLayout>
            <MDXRenderer>{post.body}</MDXRenderer>
          </MyMdxLayout>
        }
        <hr
          style={{
            marginBottom: rhythm(0.25),
          }}
        />
        <div 
          style={{
            fontSize: "0.8em", 
            marginBottom: rhythm(1),
            color: "var(--textSecondary)" 
          }}>© Attribution Required | {` `}
          <span style={{fontSize:"0.9em"}}>转载请注明原作者与本站链接</span>
        </div>
        <footer>
          <Bio />
        </footer>
      </article>
      {post.frontmatter.issueId &&
      <UtterancesComments issueId={post.frontmatter.issueId} />
      }
      <GithubCorner url={githubUrl} />
      <Fab className="hide-on-desktop" isOpen={menuIsOpen} setOpen={setMenuOpen} />
      <nav style={{ marginTop: rhythm(2) }}>
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    mdx(fields: { slug: { eq: $slug } }) {
      id
      excerpt
      body
      tableOfContents
      slug
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        issueId
        english
        translate {
          title
          url
          author
        }
      }
    }
  }
`
