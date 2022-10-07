import React from "react"

export default function Figure({children, caption} : React.PropsWithChildren<{caption: string}>) {
  return <figure>
    <>
      {children}
    </>
    <figcaption>{caption}</figcaption>
  </figure>
}
