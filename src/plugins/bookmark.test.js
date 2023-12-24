import * as bookmark from "./bookmark.js";
import { expect, test } from "vitest"

import * as bookmark from "./bookmark.js";
import { expect, test } from "vitest"

test("slug function should return the correct slug", () => {
  expect(bookmark.slug(new URL("https://blog.yujinyan.me/posts/understanding-kotlin-suspend-functions")))
    .toBe("blog.yujinyan.me_posts_understanding-kotlin-suspend-functions")
});