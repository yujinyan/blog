import React from "react"
import Helmet from "react-helmet"
import { graphql, Link } from "gatsby"

import Bio from "../components/Bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import GithubCorner from "../components/GithubCorner"
import { TranslateMark } from "../components/translate"
import get from "lodash/get"
import "./index.css"

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMdx.nodes

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="All posts | Yu Jinyan's Blog" />
      <Helmet htmlAttributes={{ lang: "zh-cmn-Hans" }} />
      <GithubCorner url="https://github.com/yujinyan/blog" />
      <Bio />
      {posts.map(post => {
        const title = post.frontmatter.title || post.fields.slug
        return (
          <article key={post.fields.slug} className="prose dark:prose-invert">
            <header className="mb-2">
              <h3 className="mb-0 leading-none">
                <Link to={post.fields.slug}>
                  {get(post, "frontmatter.translate.title") ? (
                    <TranslateMark />
                  ) : null}
                  <span style={{ verticalAlign: "middle" }}>{title}</span>
                </Link>
              </h3>
              <small className="font-subtitle text-caption">{post.frontmatter.date}</small>
            </header>
            <section
              className="excerpt"
              dangerouslySetInnerHTML={{
                __html: post.frontmatter.description || post.excerpt,
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
      filter: { 
        internal: { contentFilePath: { regex: "/posts/" } }
        frontmatter: { hidden: { ne: true } }
      }
    ) {
        nodes {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
          }
        }
    }
  }
`
