import {createSignal, createEffect } from "solid-js"

export default function useScrollSpy(ids: string[]) {

  const [active, setActive] = createSignal<Set<string>>(new Set)

  createEffect(() => {
    if (!window) return
    // https://www.bram.us/2020/01/10/smooth-scrolling-sticky-scrollspy-navigation/

    const observer = new IntersectionObserver(entries => {
      const newSet = new Set(active())
      entries.forEach(entry => {
        const id = entry.target.getAttribute("id")
        if (entry.intersectionRatio > 0) {
          newSet.add(id as string)
        } else {
          newSet.delete(id as string)
        }
      })
      if (!eqSet(active(), newSet)) {
        setActive(newSet)
        console.log(`new active: [${Array.from(newSet)}]`)
      }
    })

    ids.forEach((id) => {
      const node = document.getElementById(id)
      node && observer.observe(node)
    })

    return observer.disconnect
  }, ids)

  return (id: string) => active().has(id)
}

function eqSet(as: Set<string>, bs: Set<string>) {
  if (as.size !== bs.size) return false
  for (let a of as) if (!bs.has(a)) return false
  return true
}
