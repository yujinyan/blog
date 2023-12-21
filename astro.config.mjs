import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import rehypePrettyCode from 'rehype-pretty-code';
import { visit } from 'unist-util-visit';
import solidJs from "@astrojs/solid-js";
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import path from "path"


// https://flaviocopes.com/fix-dirname-not-defined-es-module-scope/
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// https://astro.build/config
export default defineConfig({
  site: 'https://blog.yujinyan.me',
  integrations: [mdx(), sitemap(), tailwind(), solidJs()],
  vite: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      }
    }
  },
  markdown: {
    extendDefaultPlugins: true,
    syntaxHighlight: false,
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex, [rehypePrettyCode, {
      // theme: "solarized-dark",
      // theme: "material-theme-palenight",
      theme: "one-dark-pro",
      onVisitLine(node) {
        visit(node, n => n.type === "text", n => {
          if (n.value.replace(/\s/g, '') === '//highlight-line') {
            n.value = '';
            if (!node.properties) {
              node.properties = {};
            }
            if (!node.properties['className']) {
              node.properties['className'] = [];
            }
            node.properties['className'].push("highlighted-line");
          }
        });
      },
      onVisitHighlightedLine(node) {
        node.properties.className.push("highlighted-line");
      }
    }]]
  }
  // markdown: {
  //   shikiConfig: {
  //     // Choose from Shiki's built-in themes (or add your own)
  //     // https://github.com/shikijs/shiki/blob/main/docs/themes.md
  //     theme: 'material-theme-palenight',
  //     // Add custom languages
  //     // Note: Shiki has countless langs built-in, including .astro!
  //     // https://github.com/shikijs/shiki/blob/main/docs/languages.md
  //     langs: [],
  //     // Enable word wrap to prevent horizontal scrolling
  //     // wrap: true,
  //   },
  // },
});