import React from "react"
import Image from "gatsby-image"


export default ({ title, author, year, coverFile }) => {
  return (
    <div>
      <Image fluid={coverFile.childImageSharp.fluid} className="rounded shadow-lg" />
      <p className="text-2xl font-subtitle mt-4 mb-0 leading-tight font-bold text-right">{title}</p>
      <p className="font-sans italic m-0 text-right text-opacity-60">{author}, {year}</p>
    </div>
  )
}
