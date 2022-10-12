import React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"
import Image from "gatsby-image"
import "./bookshelf.scss"
import get from "lodash/get"

const BookShelfPage = ({ data, location }) => {
  const books = data.allBook.edges.map((it) => it.node)
  const booksByStatus = groupBy(books, (book) => book.status)

  return <Layout location={location}>
    <Title>已读 | Done</Title>
    <BookGrid books={booksByStatus.get("done")} />
    <Title>想读 | Planned</Title>
    <BookGrid books={booksByStatus.get("planned")} />
  </Layout>
}

const Title = ({ children }) => (<h2 className="mb-4 mt-8">{children}</h2>)

const BookGrid = ({ books }) => (
  <div className="flex items-end flex-wrap gap-4">
    {books.map((book) =>
      <div className="hover:scale-110 hover:z-50 transition-transform">
        <Link to={get(book, "post.fields.slug")} style={{ textDecoration: "none" }}>
          <Image fluid={book.coverFile.childImageSharp.fluid}
                 className="rounded shadow-xl xl:w-48 w-36 border dark:border-gray-500" />
        </Link>
      </div>,
    )}
  </div>
)

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
        status
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

/**
 * https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
 * @description
 * Takes an Array<V>, and a grouping function,
 * and returns a Map of the array grouped by the grouping function.
 *
 * @param list An array of type V.
 * @param keyGetter A Function that takes the the Array type V as an input, and returns a value of type K.
 *                  K is generally intended to be a property key of V.
 *
 * @returns Map of the array grouped by the grouping function.
 */
//export function groupBy<K, V>(list: Array<V>, keyGetter: (input: V) => K): Map<K, Array<V>> {
//    const map = new Map<K, Array<V>>();
function groupBy(list, keyGetter) {
  const map = new Map()
  list.forEach((item) => {
    const key = keyGetter(item)
    const collection = map.get(key)
    if (!collection) {
      map.set(key, [item])
    } else {
      collection.push(item)
    }
  })
  return map
}

