import * as cheerio from "cheerio"
import { URL, fileURLToPath } from 'node:url';
import fs from 'fs';
import path from "node:path"

import { resolve } from 'path'

const pathToThisFile = resolve(fileURLToPath(import.meta.url))
const pathPassedToNode = resolve(process.argv[1])
const isThisFileBeingRunViaCLI = pathToThisFile.includes(pathPassedToNode)


/**
 * @param {URL} url 
 * @returns {string}
 */
export function slug(url) {
  return `${url.host}${url.pathname}`
    .replace(/\/$/, "")
    .replaceAll("/", "_")
}

/**
 * @param {URL} url 
 * @returns 
 */
async function fetchWebpage(url) {
  if (!url) {
    console.error('Please provide a URL as a command line argument');
    process.exit(1);
  }

  try {
    const response = await fetch(url.href);
    return await response.text();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (isThisFileBeingRunViaCLI) {
  const url = new URL(process.argv[2]);
  const bookmarkContentPath = path.join("src/content/bookmark")
  const dataFilename = slug(url) + ".json"
  console.log(`path is ${path.join(bookmarkContentPath, dataFilename)}`)

  if (fs.existsSync(path.join(bookmarkContentPath, dataFilename))) {
    console.log('File already exists. Exiting the script.');
    process.exit(0);
  }

  const $ = cheerio.load(await fetchWebpage(url));

  const title = $('meta[property="og:title"]').attr("content")
  const image = $('meta[property="og:image"]').attr("content")
  const description = $('meta[property="og:description"]').attr("content")

  const imageLocalPath = await (async () => {
    if (!image) return undefined;
    const url = new URL(image)
    const response = await fetch(image)
    const buffer = await response.arrayBuffer()
    const imageBuffer = Buffer.from(buffer)

    const dir = [bookmarkContentPath, url.host];
    const filename = path.basename(new URL(image).pathname)

    const imagePath = path.join(...dir, filename)
    const imageDir = path.join(...dir);
    if (fs.existsSync(imagePath)) {
      return path.join(url.host, filename);
    }
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }
    fs.writeFileSync(imagePath, imageBuffer);
    return path.join(url.host, filename);
  })()

  const data = {
    title, image: `./${imageLocalPath}`, description, url
  }

  const filepath = path.join(bookmarkContentPath, dataFilename)
  const json = JSON.stringify(data, null, 2)
  fs.writeFileSync(filepath, json);
  console.log(`Wrote data to ${filepath}:`)
  console.log(json)
}

