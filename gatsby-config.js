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
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
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
          // need to put before `gatsby-remark-prismjs`
          `gatsby-remark-autolink-headers`,
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
          {
            resolve: `gatsby-remark-custom-blocks`,
            options: {
              blocks: {
                tip: {
                  classes: "tip",
                  title: "optional"
                }
              }
            }
          }
        ],
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
    `gatsby-plugin-sass`

    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}
