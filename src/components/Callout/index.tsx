import React from "react"


const Callout = ({ emoji, children, className }:
                      React.PropsWithChildren<{ emoji: string, className?: string }>,
) => (
  <div className={`custom-block tip ${className || ""}`}>
    <div className="custom-block-heading">{emoji}</div>
    <div className="custom-block-body">{children}</div>
  </div>
)

export default Callout
