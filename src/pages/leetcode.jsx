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


const LeetCodePage =  ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMdx.edges

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="LeetCode Notes | Yu Jinyan's Blog" />
      <Helmet htmlAttributes={{ lang: "zh-cmn-Hans" }} />
      <GithubCorner url="https://github.com/yujinyan/blog" />
      <Bio />
      {posts.map(({ node }) => {
        const title = node.frontmatter.title || node.fields.slug
        return (
          <article key={node.fields.slug} className="my-4">
            <header>
              <h3 className="m-0 -mb-2">
                <Link style={{ boxShadow: `none` }} to={node.fields.slug}>
                  {get(node, "frontmatter.translate.title") ? (
                    <TranslateMark />
                  ) : null}
                  <span style={{ verticalAlign: "middle" }}>{title}</span>
                </Link>
              </h3>
              <small className="caption">{node.frontmatter.date}</small>
            </header>
          </article>
        )
      })}
    </Layout>
  )
}

export default LeetCodePage

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMdx(
      sort: { fields: [frontmatter___date], order: DESC },
      filter: { internal: { contentFilePath: { regex: "/leetcode/" }}}
    ) {
      edges {
        node {
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
  }
`
