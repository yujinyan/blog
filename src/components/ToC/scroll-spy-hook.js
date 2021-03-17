import { useEffect, useState } from "react"

function useScrollSpy(ids) {

  const [active, setActive] = useState(new Set)

  useEffect(() => {
    if (!window) return
    // https://www.bram.us/2020/01/10/smooth-scrolling-sticky-scrollspy-navigation/

    const observer = new IntersectionObserver(entries => {
      const newSet = new Set(active)
      entries.forEach(entry => {
        const id = entry.target.getAttribute("id")
        if (entry.intersectionRatio > 0) {
          newSet.add(id)
        } else {
          newSet.delete(id)
        }
      })
      if (!eqSet(active, newSet)) {
        setActive(newSet)
        console.log(`new active: [${Array.from(newSet)}]`)
      }
    })

    ids.forEach((id) => {
      const node = document.getElementById(id)
      node && observer.observe(node)
    })
  }, ids)

  return (id) => active.has(id)
}

function eqSet(as, bs) {
  if (as.size !== bs.size) return false
  for (let a of as) if (!bs.has(a)) return false
  return true
}

export default useScrollSpy