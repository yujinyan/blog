import React from "react"
import Helmet from "react-helmet"
import { Link, graphql } from "gatsby"

import Bio from "../components/Bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import GithubCorner from "../components/GithubCorner"
import AdobeFont from "../components/AdobeFont"
import { rhythm } from "../utils/typography"
import { TranslateMark } from "../components/translate"
import get from "lodash/get"
import "./index.css"

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMdx.edges

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="All posts | Yu Jinyan's Blog" />
      <Helmet htmlAttributes={{ lang: "zh-cmn-Hans" }} />
      <AdobeFont />
      <GithubCorner url="https://github.com/yujinyan/blog" />
      <Bio />
      {posts.map(({ node }) => {
        const title = node.frontmatter.title || node.fields.slug
        return (
          <article key={node.fields.slug}>
            <header>
              <h3
                style={{
                  marginBottom: rhythm(1 / 4),
                }}
              >
                <Link style={{ boxShadow: `none` }} to={node.fields.slug}>
                  {get(node, "frontmatter.translate.title") ? (
                    <TranslateMark />
                  ) : null}
                  <span style={{ verticalAlign: "middle" }}>{title}</span>
                </Link>
              </h3>
              <small className="subtitle"><i>{node.frontmatter.date}</i></small>
            </header>
            <section
              className="excerpt"
              dangerouslySetInnerHTML={{
                __html: node.frontmatter.description || node.excerpt,
              }}>
            </section>
          </article>
        )
      })}
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMdx(
      sort: { fields: [frontmatter___date], order: DESC },
      filter: { fileAbsolutePath: { regex: "/posts/" }}
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            translate {
              title
            }
          }
        }
      }
    }
  }
`
