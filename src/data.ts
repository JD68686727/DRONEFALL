export const WIDTH = 1280
export const HEIGHT = 720
export const ROAD = 74
export const PAD = 25
export const HQ = { x: 1140, y: 530 }
export interface Point { x: number; y: number }

// Sample rounded bends into a shared polyline for drawing, movement and placement.
const corners = [[-40,190],[810,190],[810,367],[340,367],[340,530],[1140,530]]
export const route: Point[] = [{x: -40, y: 190}]
for (let i = 1; i < corners.length - 1; i++) {
  const [x,y] = corners[i]
  const [px,py] = corners[i-1]
  const [nx,ny] = corners[i+1]
  const ax = x + Math.sign(px-x)*65, ay = y + Math.sign(py-y)*65
  const bx = x + Math.sign(nx-x)*65, by = y + Math.sign(ny-y)*65
  for (let j = 0; j <= 16; j++) {
    const t = j/16, u = 1-t
    route.push({x:u*u*ax+2*u*t*x+t*t*bx, y:u*u*ay+2*u*t*y+t*t*by})
  }
}
route.push(HQ)

export const towers = {
  mg: {name:'MG-Turm', price:250, range:150, damage:12, interval:.28, splash:0, color:'#a5e2ae', role:'Schneller Einzelzielschaden'},
  rocket: {name:'Raketenwerfer', price:700, range:198, damage:63, interval:1.23, splash:63, color:'#f6be70', role:'Flächenschaden gegen Gruppen'},
  laser: {name:'Laserkanone', price:1200, range:175, damage:15, interval:.12, splash:0, color:'#73e1f4', role:'Dauerfeuer gegen robuste Ziele'},
} as const
export type TowerKind = keyof typeof towers

export const enemies = {
  scout: {hp:52, speed:148, bounty:17, leak:1, color:'#f2c779'},
  crawler: {hp:184, speed:87, bounty:34, leak:3, color:'#f1876e'},
} as const
type EnemyKind = keyof typeof enemies
type Group = [kind: EnemyKind, count: number, spacing: number]
export const waves: Group[][] = [
  [['scout',10,.65]],
  [['scout',13,.48],['crawler',2,1.2]],
  [['crawler',5,.84],['scout',12,.38]],
  [['scout',23,.25],['crawler',5,.72]],
  [['crawler',10,.46],['scout',17,.32]],
  [['scout',30,.2],['crawler',12,.51]],
  [['crawler',9,.39],['scout',20,.2],['crawler',9,.36]],
  [['scout',38,.15],['crawler',19,.31]],
  [['crawler',16,.30],['scout',39,.14],['crawler',11,.28]],
  [['scout',46,.13],['crawler',38,.25],['scout',24,.16]],
]
// Later waves field reinforced versions of the same two enemy classes.
export const armorByWave = [1, 1, 1, 1, 1.08, 1.16, 1.28, 1.42, 1.62, 1.9]

export const obstacles = [
  {x:1000,y:132,w:182,h:105},
  {x:92,y:410,w:105,h:128},
  {x:685,y:625,w:188,h:49},
]
