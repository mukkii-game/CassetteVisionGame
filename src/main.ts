import { CVEngine } from './engine/engine'
import { TitleScene } from './games/mosaku/title'
import { mountTouchControls } from './ui/touch'
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) throw new Error('#app missing')

app.innerHTML = `
  <div class="shell">
    <header class="top">
      <h1>MOSAKU</h1>
      <p>Cassette Vision soft-constraint demo</p>
    </header>
    <canvas id="screen" width="75" height="60" aria-label="Game screen"></canvas>
    <div id="touch-root"></div>
    <footer class="help">
      <span>A/D / ←→ Move</span>
      <span>Mouse L / F Axe</span>
      <span>Mouse R / Space / W Jump</span>
      <span>Enter Start</span>
    </footer>
  </div>
`

const canvas = document.querySelector<HTMLCanvasElement>('#screen')!
const touchRoot = document.querySelector<HTMLDivElement>('#touch-root')!

const eng = new CVEngine(canvas)
mountTouchControls(touchRoot, eng.input)
eng.setScene(new TitleScene(eng))
eng.start()

// Unlock audio on first gesture
const unlock = () => {
  eng.sound.ensure()
  window.removeEventListener('pointerdown', unlock)
  window.removeEventListener('keydown', unlock)
}
window.addEventListener('pointerdown', unlock)
window.addEventListener('keydown', unlock)
