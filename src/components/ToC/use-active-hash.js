import { useEffect, useState } from "react"

export const useActiveHash = (itemIds, rootMargin = undefined) => {
  const isSSR = typeof window === "undefined"
  const [activeHash, setActiveHash] = useState(``)

  useEffect(() => {
    if (isSSR) return []
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveHash(entry.target.id)
          }
        })
      },
      { rootMargin: rootMargin || `0% 0% -80% 0%` }
    )

    itemIds.forEach(id => {
      // handle Chinese characters
      const decoded = decodeURI(id)
      observer.observe(document.getElementById(decoded))
    })

    return () => {
      itemIds.forEach(id => {
        const element = document.getElementById(id)
        element && observer.unobserve(element)
      })
    }
  }, [])

  return activeHash
}