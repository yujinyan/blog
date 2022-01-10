import React from "react"
import Image from "gatsby-image"

import "./style.scss"

export default ({ title, author, year, coverFile }) => {
  return (
    <div className="book-widget flex xl:block items-center">
      <Image fluid={coverFile.childImageSharp.fluid} className="rounded shadow-lg xl:w-64 w-32" />
      <div className="flex-auto ml-4 xl:ml-0">
        <p className="title">{title}</p>
        <p className="subtitle">{author}, {year}</p>
      </div>
    </div>
  )
}
