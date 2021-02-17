import React, { useState } from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm, scale } from "../utils/typography"
import { TranslateInfo, TranslateMark } from "../components/translate"
import ToC from "../components/ToC"
import Fab from "../components/Fab"
import { UtterancesComments } from "../components/utterances"
import GithubCorner from "../components/GithubCorner"
import "./blog-post.scss"

const BlogPostTemplate = ({ data, pageContext, location }) => {
  const post = data.markdownRemark
  const siteTitle = data.site.siteMetadata.title
  const { previous, next } = pageContext
  const [menuIsOpen, setMenuOpen] = useState(false)

  return (
    <Layout location={location} title={siteTitle}>
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
      />
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
              fontFamily: "Georgia, serif"
            }}
          >
            {post.frontmatter.date}
          </p>
        </header>
        {post.tableOfContents &&
          <div class={`sidebar ${menuIsOpen ? "" : "hide"}`}>
            <ToC html={post.tableOfContents} showOnMobile={menuIsOpen} />
          </div>}
        {post.frontmatter.translate &&
          TranslateInfo(post.frontmatter.translate)}
        <section dangerouslySetInnerHTML={{ __html: post.html }} />
        <hr
          style={{
            marginBottom: rhythm(1),
          }}
        />
        <footer>
          <Bio />
        </footer>
      </article>
      {post.frontmatter.issueId &&
        <UtterancesComments issueId={post.frontmatter.issueId} />
      }
      <GithubCorner url={
        post.frontmatter.issueId ?
          `https://github.com/yujinyan/blog/issues/${post.frontmatter.issueId}` :
          "https://github.com/yujinyan/blog"
      } />
      <Fab isOpen={menuIsOpen} setOpen={setMenuOpen} />
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
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      tableOfContents(
        absolute: false
      )
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        issueId
        translate {
          title
          url
          author
        }
      }
    }
  }
`
