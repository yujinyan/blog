# [blog.yujinyan.me](https://blog.yujinyan.me)

Cloned from [Gatsby's blog starter](https://github.com/gatsbyjs/gatsby-starter-blog) and mostly inspired by [Dan Abramov's blog](https://github.com/gaearon/overreacted.io).

## 💡 Comments are welcome!

可以通过 issues 对文章进行评论，欢迎分享您的想法！

The `issues` feature of this project serves as comment section for blog contents, powered by [utterances](https://utteranc.es/).

To enable the comment section for a blog post, I manually create an issue, take note of the issue id and record it in the corresponding post's front matter with a custom attribute `issueId`. This could be automated in the future.

Feel free to open new issues for older posts.

## 🚀 Develop

Start dev server.
```shell
gatsby develop
```

Build production files.
```shell
gatsby build
```

Currently production files are built by and hosted on [Vercel](https://vercel.com/).

## 🧐 What's inside?
    .
    ├── src
    ├── .gitignore
    ├── .prettierrc
    ├── gatsby-browser.js
    ├── gatsby-config.js
    ├── gatsby-node.js
    ├── gatsby-ssr.js
    ├── LICENSE
    ├── package-lock.json
    ├── package.json
    └── README.md

**`gatsby-browser.js`**: This file is where Gatsby expects to find any usage of the [Gatsby browser APIs](https://www.gatsbyjs.org/docs/browser-apis/) (if any). These allow customization/extension of default Gatsby settings affecting the browser.

**`gatsby-config.js`**: This is the main configuration file for a Gatsby site. This is where you can specify information about your site (metadata) like the site title and description, which Gatsby plugins you’d like to include, etc. (Check out the [config docs](https://www.gatsbyjs.org/docs/gatsby-config/) for more detail).

**`gatsby-node.js`**: This file is where Gatsby expects to find any usage of the [Gatsby Node APIs](https://www.gatsbyjs.org/docs/node-apis/) (if any). These allow customization/extension of default Gatsby settings affecting pieces of the site build process.

**`gatsby-ssr.js`**: This file is where Gatsby expects to find any usage of the [Gatsby server-side rendering APIs](https://www.gatsbyjs.org/docs/ssr-apis/) (if any). These allow customization of default Gatsby settings affecting server-side rendering.

## 🎓 Learning Gatsby

Looking for more guidance? Full documentation for Gatsby lives [on the website](https://www.gatsbyjs.org/). Here are some places to start:

- **For most developers, we recommend starting with our [in-depth tutorial for creating a site with Gatsby](https://www.gatsbyjs.org/tutorial/).** It starts with zero assumptions about your level of ability and walks through every step of the process.

- **To dive straight into code samples, head [to our documentation](https://www.gatsbyjs.org/docs/).** In particular, check out the _Guides_, _API Reference_, and _Advanced Tutorials_ sections in the sidebar.
