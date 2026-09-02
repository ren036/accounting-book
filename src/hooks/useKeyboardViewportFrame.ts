import { useEffect, useState } from 'react'
import { useDynamicViewport } from 'use-dynamic-viewport'

export function useKeyboardViewportFrame() {
  const viewportState = useDynamicViewport()
  const [offsetTop, setOffsetTop] = useState(0)

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return

    let animationFrame = 0

    function scheduleSync() {
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(() => {
        setOffsetTop(viewport?.offsetTop ?? 0)
      })
    }

    scheduleSync()
    viewport.addEventListener('resize', scheduleSync)
    viewport.addEventListener('scroll', scheduleSync)

    return () => {
      cancelAnimationFrame(animationFrame)
      viewport.removeEventListener('resize', scheduleSync)
      viewport.removeEventListener('scroll', scheduleSync)
    }
  }, [])

  return { ...viewportState, offsetTop }
}
