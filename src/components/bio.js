/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"
import telegram from "./Bio/telegram.svg"
import twitter from "./Bio/twitter.svg"
import "./Bio/bio.css"

import { rhythm } from "../utils/typography"

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
    <div
      style={{
        display: `flex`,
        marginBottom: rhythm(2.5),
        alignItems: "center"
      }}
    >
      <Image
        fixed={data.avatar.childImageSharp.fixed}
        alt={author.name}
        style={{
          marginRight: rhythm(1 / 2),
          marginBottom: 0,
          minWidth: 50,
          borderRadius: `100%`,
        }}
        imgStyle={{
          borderRadius: `50%`,
        }}
      />
      <p className="subtitle" style={{ margin: 0, lineHeight: "1.5em" }}>
        Written by{" "}
        <strong><a href={`mailto:i@yujinyan.me`}>i@yujinyan.me</a></strong>.
        <a className="social-icon " href="https://twitter.com/yujinyan92"><img src={twitter} /></a>
        <a className="social-icon" href="https://t.me/fish_study_plz"><img src={telegram} /></a>
        <br />
        Web, JVM, Android. Kotlin enthusiast.<br />
        {/* Find me on <a href="https://twitter.com/yujinyan92">Twitter</a>. */}
        {/* I also chat on <a href="https://t.me/fish_study_plz">Telegram</a>. */}
        {/* {author.summary} */}
      </p>
    </div>
  )
}

export default Bio
