import React from "react"

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
  <p className="text-sm">
    <p>原文：<a href={translate.url}>{translate.title}</a></p>
    <p className="-mt-2">作者：{translate.author}</p>
  </p>
)
