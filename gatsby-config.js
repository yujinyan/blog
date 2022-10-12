module.exports = {
  siteMetadata: {
    title: `🐟 Blog`,
    author: {
      name: `Yu Jinyan`,
      summary: `Software Developer since 2016.`,
    },
    description: `Yu Jinyan's personal site to blog his learnings of technology.`,
    siteUrl: `https://blog.yujinyan.me`,
    social: {
      twitter: `yujinyan92`,
    },
  },
  plugins: [
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        mdxOptions: {
          remarkPlugins: [
            require("remark-gfm"), // add support for tables
            require(`remark-math`),
            // require("remark-html-katex"),
          ],
          rehypePlugins: [
            require('rehype-katex'),
            require(`./plugins/rehype-leetcode`),
          ]
        },
        extensions: [".md", ".mdx"],
        gatsbyRemarkPlugins: [
          { // https://github.com/gatsbyjs/gatsby/issues/21592
            resolve: require.resolve("./plugins/gatsby-remark-embed-svg"),
          },
          `gatsby-remark-autolink-headers`,
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
            },
          },

          // {
          //   resolve: require.resolve(`./plugins/gatsby-remark-figure-block`),
          // },
        ],
      },
    },
    // `gatsby-plugin-mdx`,
    // {
    //   // https://github.com/gatsbyjs/gatsby/issues/21866
    //   resolve: `gatsby-plugin-mdx`,
    //   options: {
    //     mdxOptions: {
    //       remarkPlugins: [
    //         // require(`remark-math`),
    //         // require("remark-html-katex"),
    //         // import("remark-frontmatter")
    //       ],
    //       rehypePlugins: [
    //         // require(`./plugins/rehype-smallcap`),
    //         // require(`./plugins/rehype-leetcode`),
    //       ],
    //     },
    //     extensions: [".md", ".mdx"],
    //     gatsbyRemarkPlugins: [
    //       { // https://github.com/gatsbyjs/gatsby/issues/21592
    //         resolve: require.resolve("./plugins/gatsby-remark-embed-svg"),
    //       },
    //       {
    //         resolve: `gatsby-remark-images`,
    //         options: {
    //           maxWidth: 590,
    //         },
    //       },
    //       {
    //         resolve: `gatsby-remark-responsive-iframe`,
    //         options: {
    //           wrapperStyle: `margin-bottom: 1.0725rem`,
    //         },
    //       },
    //       // need to put before `gatsby-remark-prismjs`
    //       `gatsby-remark-autolink-headers`,
    //       {
    //         resolve: `gatsby-remark-katex`,
    //         options: {
    //           strict: `ignore`,
    //         },
    //       },
    //       // need to put after `gatsby-remark-autolink-headers`
    //       {
    //         resolve: require.resolve("./plugins/gatsby-remark-hanzi-nowrap"),
    //       },
    //       `gatsby-remark-prismjs`,
    //       `gatsby-remark-copy-linked-files`,
    //       `gatsby-remark-smartypants`,
    //       {
    //         resolve: `gatsby-remark-custom-blocks`,
    //         options: {
    //           blocks: {
    //             tip: {
    //               classes: "tip pull-left",
    //               title: "optional",
    //             },
    //             fig: {
    //               classes: "svg",
    //               title: "optional",
    //               containerElement: "figure",
    //               titleElement: "figcaption",
    //             },
    //           },
    //         },
    //       },
    //       {
    //         resolve: require.resolve(`./plugins/gatsby-remark-figure-block`),
    //       },
    //     ],
    //   },
    // },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/pages`,
        name: `pages`,
      },
    },
    // {
    //   resolve: `gatsby-plugin-page-creator`,
    //   options: {
    //     path: `${__dirname}/content/blog`,
    //   },
    // },
    {
      resolve: `gatsby-transformer-csv`,
      options: {
        // remove "Csv" suffix
        typeName: ({ node }) => node.name.charAt(0).toUpperCase() + node.name.slice(1),
      },
    },

    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    // `gatsby-plugin-feed-mdx`, // this throws error on build after migrating to mdx2
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Personal Blog of Yu Jinyan`,
        short_name: `Yu's Blog`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#007acc`,
        // https://www.gatsbyjs.com/plugins/gatsby-plugin-manifest/#remove-theme-color-meta-tag
        theme_color_in_head: false,
        display: `minimal-ui`,
        icon: `content/assets/fish.png`,
      },
    },
    `gatsby-plugin-react-helmet`,
    // {
    //   resolve: `gatsby-plugin-typography`,
    //   options: {
    //     pathToConfigModule: `src/utils/typography`,
    //   },
    // },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-117949087-1`,
        head: true,
      },
    },
    `gatsby-plugin-dark-mode`,
    `gatsby-plugin-postcss`,
    `gatsby-plugin-sass`,
    `gatsby-plugin-twitter`,
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
    `gatsby-plugin-emotion`
  ],
}
