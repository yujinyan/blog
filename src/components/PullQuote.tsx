import React from "react"


export default function PullQuote({ children, emoji }:
                                    React.PropsWithChildren<{ emoji?: string }>) {
  return <div className="ml-0 md:-ml-16 mt-12 md:mt-auto relative border-t border-b border-hr">
    {
      emoji && <div className="absolute ml-0 md:-ml-2 -top-12 text-[2.5rem]">{emoji}</div>
    }
    <div>
      {children}
    </div>
  </div>
}
