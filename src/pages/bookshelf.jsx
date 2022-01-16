import React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"
import BookColumn from "@/components/BookColumn"
import Image from "gatsby-image"
import "./bookshelf.scss"
import get from "lodash/get"

const BookShelfPage = ({ data, location }) => {
  const books = data.allBook.edges.map((it) => it.node)

  return <Layout location={location}>
    <div className="flex items-end flex-wrap">
      {books.map((book) =>
          <div className="hover:scale-110 hover:z-50 transition-transform">
            <Link to={get(book, "post.fields.slug")} style={{ textDecoration: "none" }}>
              <Image fluid={book.coverFile.childImageSharp.fluid} className="rounded shadow-xl xl:w-48 w-36 m-2 border dark:border-gray-500" />
            </Link>
          </div>,
        // <BookColumn {...book} />,
      )}
    </div>
  </Layout>
}

export default BookShelfPage

export const pageQuery = graphql`
query MyQuery {
  site {
    siteMetadata {
      title
    }
  }
  allBook {
    edges {
      node {
        author
        title
        year
        coverFile {
          childImageSharp {
            fixed {
               ...GatsbyImageSharpFixed
            }
            fluid {
               ...GatsbyImageSharpFluid
            }
          }
        }
        post {
          fields { slug }
        }
      }
    }
  }
}
`
