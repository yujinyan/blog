import React from "react"
import Image from "gatsby-image"

import "./style.scss"

export default ({ title, author, year, coverFile }) => {
  return (
    <div className="book-widget flex xl:block items-center" key={title}>
      <Image fluid={coverFile.childImageSharp.fluid}
             className="item-cover border dark:border-gray-500 rounded shadow-lg xl:w-64 w-32" />
      <div className="item-column flex-auto ml-4 xl:ml-0">
        <p className="title">{title}</p>
        <p className="subtitle">{author}, {year}</p>
      </div>
    </div>
  )
}
