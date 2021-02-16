import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import GithubCorner from "../components/GithubCorner"
import { rhythm } from "../utils/typography"
import { TranslateMark } from "../components/translate"
import get from "lodash/get"
import "./index.css"

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMarkdownRemark.edges

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="All posts | Yu Jinyan's Blog" />
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
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt(format: HTML)
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
