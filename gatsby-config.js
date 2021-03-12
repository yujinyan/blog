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
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [".md", ".mdx"],
        gatsbyRemarkPlugins: [
          { // https://github.com/gatsbyjs/gatsby/issues/21592
            resolve: require.resolve("./plugins/gatsby-remark-embed-svg"),
          },
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          {

            resolve: `gatsby-remark-smallcaps`,
            options: {
              className: "smcp",
            },
          },
          `gatsby-remark-katex`,
          // need to put before `gatsby-remark-prismjs`
          `gatsby-remark-autolink-headers`,
          // need to put after `gatsby-remark-autolink-headers`
          {
            resolve: require.resolve("./plugins/gatsby-remark-hanzi-nowrap"),
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
          {
            resolve: `gatsby-remark-custom-blocks`,
            options: {
              blocks: {
                tip: {
                  classes: "tip",
                  title: "optional",
                },
                fig: {
                  classes: "svg",
                  title: "optional",
                  containerElement: "figure",
                  titleElement: "figcaption",
                },
              },
            },
          },
          {
            resolve: require.resolve(`./plugins/gatsby-remark-figure-block`),
          },
        ],
        excerpt_separator: `<!-- excerpt end -->`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        //trackingId: `ADD YOUR TRACKING ID HERE`,
      },
    },
    `gatsby-plugin-feed`,
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
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-117949087-1`,
      },
    },
    `gatsby-plugin-dark-mode`,
    `gatsby-plugin-sass`,
    `gatsby-plugin-twitter`,
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}
