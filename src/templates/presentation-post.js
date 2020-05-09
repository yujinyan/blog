import React, { useEffect } from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm, scale } from "../utils/typography"
import { TranslateInfo, TranslateMark } from "../components/translate"
import Helmet from "react-helmet"
import RemarkSlide from "../components/RemarkSlide"

const useScript = url => {
  useEffect(() => {
    const script = document.createElement("script")

    script.src = url
    script.async = true

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [url])
}

const PresentationPostTemplate = ({ data, pageContext, location }) => {
  const post = data.markdownRemark
  //   const { content } = post
  const siteTitle = data.site.siteMetadata.title
  const { previous, next } = pageContext

  // return <div>hello world</div>

  //   useScript("https://remarkjs.com/downloads/remark-latest.min.js")
  return <RemarkSlide content={post.rawMarkdownBody} />
  //   return <textarea id="source" value={post.rawMarkdownBody}></textarea>
}

export default PresentationPostTemplate

export const pageQuery = graphql`
  query PresentationPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      rawMarkdownBody
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        translate {
          title
          url
          author
        }
      }
    }
  }
`
