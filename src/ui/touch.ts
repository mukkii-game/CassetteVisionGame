import type { Input } from '../engine/input'
import type { Button } from '../engine/types'

/** On-screen touch controls for phones (Phase 3). */
export function mountTouchControls(root: HTMLElement, input: Input): () => void {
  const bar = document.createElement('div')
  bar.className = 'touch-bar'
  bar.innerHTML = `
    <div class="touch-cluster">
      <button type="button" data-btn="left" aria-label="Left">◀</button>
      <button type="button" data-btn="right" aria-label="Right">▶</button>
    </div>
    <div class="touch-cluster">
      <button type="button" data-btn="axe" aria-label="Axe">AXE</button>
      <button type="button" data-btn="jump" aria-label="Jump">JMP</button>
      <button type="button" data-btn="start" aria-label="Start">▶</button>
    </div>
  `
  root.appendChild(bar)

  const cleanups: Array<() => void> = []
  const buttons = bar.querySelectorAll<HTMLButtonElement>('button[data-btn]')
  buttons.forEach((el) => {
    const btn = el.dataset.btn as Button
    const down = (e: Event) => {
      e.preventDefault()
      input.useTouch = true
      input.setTouchButton(btn, true)
    }
    const up = (e: Event) => {
      e.preventDefault()
      input.setTouchButton(btn, false)
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointerleave', up)
    el.addEventListener('pointercancel', up)
    cleanups.push(() => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointerleave', up)
      el.removeEventListener('pointercancel', up)
    })
  })

  // Auto-enable touch UI layout on coarse pointers
  const mq = window.matchMedia('(pointer: coarse)')
  const apply = () => {
    bar.classList.toggle('visible', mq.matches || window.innerWidth < 700)
    input.useTouch = bar.classList.contains('visible')
  }
  apply()
  mq.addEventListener('change', apply)
  window.addEventListener('resize', apply)
  cleanups.push(() => {
    mq.removeEventListener('change', apply)
    window.removeEventListener('resize', apply)
    bar.remove()
    input.clearTouch()
    input.useTouch = false
  })

  return () => cleanups.forEach((fn) => fn())
}
