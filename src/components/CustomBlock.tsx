import React from "react"

export default (
  { heading, children }: { heading: JSX.Element, children: JSX.Element },
) =>
  <div className="custom-block tip">
    <div className="custom-block-heading">{heading}</div>
    <div className="custom-block-body">{children}</div>
  </div>