import React from "react"
import { rhythm, scale } from "../utils/typography"

export const TranslateMark = () => (
  <span
    style={{
      fontWeight: "normal",
      fontSize: ".5em",
      background: "#ffb74d",
      color: "white",
      borderRadius: "50%",
      padding: ".25em .35em",
      verticalAlign: "middle",
      marginRight: ".75em",
    }}
  >
    译
  </span>
)

export const TranslateInfo = translate => (
  <p
    style={{
      ...scale(-1 / 4),
    }}
  >
    <p>
      原文：<a href={translate.url}>{translate.title}</a>
    </p>
    <p style={{ marginTop: rhythm(-1) }}>作者：{translate.author}</p>
  </p>
)
