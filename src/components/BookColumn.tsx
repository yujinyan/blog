import React from "react"
import Image from "gatsby-image"

export default function BookColumn({ title, author, year, coverFile }) {
  return (
    <div className="book-widget flex xl:block items-center" key={title}>
      <Image fluid={coverFile.childImageSharp.fluid}
             className="flex-[1_0_auto] border dark:border-gray-500 rounded shadow-lg xl:w-64 w-32" />
      <div className="flex-[2_2_auto] flex-auto ml-4 xl:ml-0">
        <p className="text-2xl font-subtitle mt-4 mb-1 leading-tight font-bold xl:text-right">{title}</p>
        <p className="italic m-0 xl:text-right text-opacity-50 leading-tight">{author}, {year}</p>
      </div>
    </div>
  )
}
