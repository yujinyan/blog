const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const result = await graphql(
    `
      {
        allMdx(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
      }
    `,
  )

  if (result.errors) {
    throw result.errors
  }

  // Create blog posts pages.
  const posts = result.data.allMdx.edges

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node
    const next = index === 0 ? null : posts[index - 1].node

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous: excludingLeetCodePosts(previous),
        next: excludingLeetCodePosts(next),
      },
    })
  })
}

function excludingLeetCodePosts(post) {
  if (!post) return post
  if (post.fields.slug.includes("leetcode")) return null
  return post
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `Mdx`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}

exports.onCreateWebpackConfig = ({ stage, actions }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "~": path.resolve(__dirname, "content"),
      },
      modules: [
        path.resolve(__dirname, "src"),
        path.resolve(__dirname, "content"),
        "node_modules",
      ],
    },
  })
}

// https://www.gatsbyjs.com/docs/reference/graphql-data-layer/schema-customization/#foreign-key-fields
// https://hashinteractive.com/blog/gatsby-data-relationships-with-foreign-key-fields/
exports.createSchemaCustomization = ({ actions, schema }) => {
  const { createTypes } = actions
  const typeDefs = `
    type Mdx implements Node {
      book: Book @link(by: "alias", from: "frontmatter.book")
    }
    type Book implements Node {
      post: Mdx @link(by: "frontmatter.book", from: "alias")
    }
  `

  createTypes(typeDefs)
}

exports.createResolvers = ({ createResolvers }) => {
  const resolvers = {
    Book: {
      coverFile: {
        type: "File",
        resolve(source, args, context, info) {
          return context.nodeModel.findOne({
            type: "File",
            query: {
              filter: { absolutePath: { regex: `/${source.cover}/` } },
            },
          })
        },
      },
    },
  }
  createResolvers(resolvers)
}
