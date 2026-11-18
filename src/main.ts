import './style.css'
import { HEIGHT, towers, waves, WIDTH } from './data'
import type { Point, TowerKind } from './data'
import { Game } from './game'
import { Renderer } from './render'

const find = <T extends HTMLElement>(selector:string) => document.querySelector<T>(selector)!
const canvas = find<HTMLCanvasElement>('canvas')
const start = find<HTMLButtonElement>('#start')
const pause = find<HTMLButtonElement>('#pause')
const speed = find<HTMLButtonElement>('#speed')
const restart = find<HTMLButtonElement>('#restart')
const arsenal = find<HTMLElement>('.arsenal')
const integrity = find<HTMLOutputElement>('#integrity')
const health = find<HTMLMeterElement>('#health')
const credits = find<HTMLOutputElement>('#credits')
const wave = find<HTMLOutputElement>('#wave')
const overlay = find<HTMLElement>('#overlay')
const result = find<HTMLElement>('#result')
const summary = find<HTMLElement>('#summary')
const status = find<HTMLElement>('#status')
const renderer = new Renderer(canvas)

let game = new Game()
let selected: TowerKind|null = null
let cursor: Point|null = null
let touchPreview: Point|null = null
let paused = false
let tempoIndex = 0
let accumulator = 0
const tempos = [1,2,4]
const step = 1/60
const initialMessage = 'Turm wählen und auf freiem Gelände platzieren.'
const active = () => game.phase === 'ready' || game.phase === 'running'
const buttons = (Object.keys(towers) as TowerKind[]).map(kind => {
  const data = towers[kind]
  const button = document.createElement('button')
  button.className = 'tower'
  button.type = 'button'
  button.style.setProperty('--accent',data.color)
  button.innerHTML = `<span class="icon" aria-hidden="true">${{mg:'MG',rocket:'RW',laser:'LA'}[kind]}</span>
    <span><b>${data.name}</b><small>${data.role} · Reichweite ${data.range}</small></span>
    <span class="price">${data.price.toLocaleString('de-DE')} Cr</span>`
  button.addEventListener('click', () => {
    selected = selected === kind ? null : kind
    cursor = touchPreview = null
    message(selected ? `${data.name} ausgewählt. Bauposition auf der Karte wählen.` : initialMessage)
    sync()
  })
  arsenal.append(button)
  return {kind,button}
})

function message(text:string,error=false) {
  status.textContent = text
  status.dataset.error = String(error)
}

function sync() {
  integrity.value = `${game.integrity} / 20`
  health.value = game.integrity
  credits.value = String(game.credits)
  wave.value = `${game.wave} / ${waves.length}`
  start.disabled = game.phase !== 'ready' || paused
  start.textContent = game.phase === 'ready' ? `Welle ${game.wave+1} starten` : game.phase === 'running' ? 'Welle läuft' : 'Einsatz beendet'
  pause.disabled = game.phase !== 'running'
  pause.textContent = paused ? 'Fortsetzen' : 'Pause'
  speed.disabled = !active()
  speed.textContent = `${tempos[tempoIndex]}×`
  for (const {kind,button} of buttons) {
    button.disabled = !active() || paused
    button.setAttribute('aria-pressed',String(selected === kind))
    button.classList.toggle('unaffordable',game.credits < towers[kind].price)
  }
  canvas.classList.toggle('placing',Boolean(selected) && active() && !paused)
  overlay.hidden = active()
  if (!active()) {
    result.textContent = game.phase === 'won' ? 'Sieg · HQ gesichert' : 'Game Over · HQ zerstört'
    summary.textContent = game.phase === 'won' ? 'Alle 10 Wellen der Testkampagne abgewehrt.' : `Das HQ fiel in Welle ${game.wave}.`
  }
}

function reset() {
  game = new Game()
  selected = cursor = touchPreview = null
  paused = false
  tempoIndex = accumulator = 0
  message(initialMessage)
  sync()
}

function mapPoint(event:PointerEvent) {
  const bounds = canvas.getBoundingClientRect()
  return {x:(event.clientX-bounds.left)*WIDTH/bounds.width, y:(event.clientY-bounds.top)*HEIGHT/bounds.height}
}

canvas.addEventListener('pointermove',event => {
  if (event.pointerType === 'mouse' && selected && active() && !paused) cursor = mapPoint(event)
})
canvas.addEventListener('pointerleave',event => {
  if (event.pointerType === 'mouse') cursor = null
})
canvas.addEventListener('pointerup',event => {
  if (event.button !== 0 || !event.isPrimary || !selected || !active() || paused) return
  const point = mapPoint(event)
  cursor = point
  if (event.pointerType !== 'mouse') {
    const bounds = canvas.getBoundingClientRect()
    if (!touchPreview || Math.hypot(point.x-touchPreview.x,point.y-touchPreview.y)*bounds.width/WIDTH > 18) {
      touchPreview = point
      const error = game.placement(point,selected)
      message(error || 'Erneut auf dieselbe Stelle tippen, um zu bauen.',Boolean(error))
      return
    }
  }
  const builtAt = touchPreview ?? point
  touchPreview = null
  const error = game.buy(builtAt,selected)
  message(error || `${towers[selected].name} gebaut.`,Boolean(error))
  sync()
})
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && selected) {
    selected = cursor = touchPreview = null
    message(initialMessage)
    sync()
  }
})
start.onclick = () => {
  game.start()
  message(`Welle ${game.wave} läuft.`)
  sync()
}
pause.onclick = () => {
  paused = !paused
  touchPreview = cursor = null
  message(paused ? 'Einsatz pausiert.' : `Welle ${game.wave} läuft.`)
  sync()
}
speed.onclick = () => {
  tempoIndex = (tempoIndex+1)%tempos.length
  sync()
}
restart.onclick = reset
find<HTMLButtonElement>('#retry').onclick = () => {
  reset()
  start.focus()
}

let previous = performance.now()
function frame(now:number) {
  const elapsed = Math.min(.1,(now-previous)/1000)
  previous = now
  if (!paused) {
    const before = game.phase
    const balance = game.credits
    const hp = game.integrity
    accumulator += elapsed*tempos[tempoIndex]
    while (accumulator >= step) {
      game.step(step)
      accumulator -= step
    }
    if (before !== game.phase) {
      if (game.phase === 'ready') message(`Welle ${game.wave} abgeschlossen. Wellenbelohnung gutgeschrieben.`)
      if (game.phase === 'won') message('Testkampagne gewonnen.')
      if (game.phase === 'lost') message('Das HQ wurde zerstört.')
    }
    if (before !== game.phase || balance !== game.credits || hp !== game.integrity) sync()
  }
  renderer.draw(game,active() && !paused ? selected : null,cursor)
  requestAnimationFrame(frame)
}
sync()
requestAnimationFrame(frame)
