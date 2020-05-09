import React from "react"
import "./style.css"
import remark from "remark-slide"
// import "./remark-latest.min.js"
import { useEffect } from "react"

// const useScript = url => {
//   useEffect(() => {
//     const script = document.createElement("script")

//     script.src = url
//     script.async = true

//     document.body.appendChild(script)

//     return () => {
//       document.body.removeChild(script)
//     }
//   }, [url])
// }

const RemarkSlide = ({ content }) => {
  //   useScript("https://remarkjs.com/downloads/remark-latest.min.js")
  // require("./remark")
  // require("../../../static/remark-latest.min.js").then((remark) => remark.create())
  // useEffect(() => {
  //   import("../../../static/remark-latest.min.js").then((remark) => {
  //   // import("/static/remark-latest.min.js").then((remark) => {
  //     remark.create()
  //   })
  // })
  return (
    <>
      <script src="/remark-latest.min.js" />
      <textarea id="source" value={content} />
    </>
  )
}

export default RemarkSlide