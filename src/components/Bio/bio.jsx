/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import telegram from "./telegram.svg"
import twitter from "./twitter.svg"
import "./bio.scss"

import { rhythm } from "../../utils/typography"

const Bio = () => {
  const data = useStaticQuery(graphql`query BioQuery {
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
    <div
      className="bio"
      style={{
        display: `flex`,
        marginBottom: rhythm(2.5),
        alignItems: "center",
      }}
    >
      <StaticImage
        src="../../images/profile-pic.png"
        alt={author.name}
        layout="fixed"
        formats={["AUTO", "WEBP", "AVIF"]}
        width={50}
        height={50}
        style={{
          marginRight: rhythm(1 / 2),
          marginBottom: 0,
          minWidth: 50,
          borderRadius: `100%`,
        }}
        placeholder="blurred"
        imgStyle={{
          borderRadius: `50%`,
        }} />
      <p
        className="subtitle"
        style={{ margin: 0, lineHeight: "1.5em", fontSize: "1rem" }}
        lang="en"
      >
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
            <img src={twitter} />
          </a>
          <a
            className="social-icon"
            href="https://t.me/fish_study_plz"
            title="I also chat on Telegram"
          >
            <img src={telegram} />
          </a>
        </span>
        <br />
        Web, JVM, Android. Kotlin enthusiast.
        <br />
        {/* Find me on <a href="https://twitter.com/yujinyan92">Twitter</a>. */}
        {/* I also chat on <a href="https://t.me/fish_study_plz">Telegram</a>. */}
        {/* {author.summary} */}
      </p>
    </div>
  )
}

export default Bio
