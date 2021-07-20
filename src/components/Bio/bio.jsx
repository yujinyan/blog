/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"
import telegram from "./telegram.svg"
import twitter from "./twitter.svg"
import "./bio.scss"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/profile-pic.png/" }) {
        childImageSharp {
          fixed(width: 50, height: 50) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            twitter
          }
        }
      }
    }
  `)

  const { author, social } = data.site.siteMetadata
  return (
    <div className="flex items-center space-x-2">
      <Image
        fixed={data.avatar.childImageSharp.fixed}
        alt={author.name}
        className="rounded-full"
        imgStyle={{
          display: "inline",
          margin: 0,
        }}
      />
      <div className="font-subtitle m-0" lang="en">
        Written by{" "}
        <strong>
          <a href={`mailto:i@yujinyan.me`}>i@yujinyan.me</a>
        </strong>
        .
        <span className="nowrap">
          <a
            className="social-icon"
            href="https://twitter.com/yujinyan92"
            title="Find me on Twitter"
          >
            <img alt="twitter" src={twitter} className="inline" />
          </a>
          <a
            className="social-icon"
            href="https://t.me/fish_study_plz"
            title="I also chat on Telegram"
          >
            <img alt="telegram" src={telegram} className="inline" />
          </a>
        </span>
        <br />
        Web, JVM, Android. Kotlin enthusiast.
        <br />
        {/* Find me on <a href="https://twitter.com/yujinyan92">Twitter</a>. */}
        {/* I also chat on <a href="https://t.me/fish_study_plz">Telegram</a>. */}
        {/* {author.summary} */}
      </div>
    </div>
  )
}

export default Bio
