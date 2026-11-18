import { armorByWave, enemies, HEIGHT, HQ, obstacles, PAD, ROAD, route, towers, waves, WIDTH } from './data'
import type { Point, TowerKind } from './data'

type EnemyKind = keyof typeof enemies
export interface Enemy extends Point { kind:EnemyKind; hp:number; maxHp:number; distance:number; angle:number }
export interface Tower extends Point { kind:TowerKind; angle:number; cooldown:number }
export interface Effect extends Point {
  type:'shot'|'blast'|'wreck'; end?:Point; color:string; life:number; duration:number; radius:number
}
const distance = (a:Point,b:Point) => Math.hypot(a.x-b.x,a.y-b.y)
const segments = route.slice(1).map((end,i) => {
  const from = route[i]
  return {from, dx:end.x-from.x, dy:end.y-from.y, length:distance(from,end)}
})
const trackLength = segments.reduce((total,segment) => total+segment.length,0)

export class Game {
  credits = 550
  integrity = 20
  wave = 0
  phase: 'ready'|'running'|'won'|'lost' = 'ready'
  turrets: Tower[] = []
  attackers: Enemy[] = []
  effects: Effect[] = []
  private queue: {kind:EnemyKind; delay:number}[] = []
  private timer = 0
  private next = 0

  placement(p:Point, kind:TowerKind): string {
    if (p.x < PAD || p.y < PAD || p.x > WIDTH-PAD || p.y > HEIGHT-PAD) return 'Zu nah am Kartenrand.'
    if (distance(p,HQ)<112 || obstacles.some(o => {
      const nearest = {x:Math.max(o.x,Math.min(p.x,o.x+o.w)), y:Math.max(o.y,Math.min(p.y,o.y+o.h))}
      return distance(p,nearest)<PAD
    })) return 'Diese Fläche ist gesperrt.'
    if (segments.some(({from,dx,dy,length}) => {
      const t = Math.min(1,Math.max(0,((p.x-from.x)*dx+(p.y-from.y)*dy)/(length*length)))
      return distance(p,{x:from.x+t*dx,y:from.y+t*dy}) < ROAD/2+PAD
    })) return 'Die Route muss frei bleiben.'
    if (this.turrets.some(t => distance(t,p)<PAD*2)) return 'Zu nah an einem anderen Turm.'
    return this.credits < towers[kind].price ? 'Nicht genug Credits.' : ''
  }

  buy(p:Point, kind:TowerKind) {
    const error = this.placement(p,kind)
    if (error) return error
    this.credits -= towers[kind].price
    this.turrets.push({...p,kind,angle:-Math.PI/2,cooldown:0})
    return ''
  }

  start() {
    if (this.phase !== 'ready') return
    this.queue = waves[this.wave].flatMap(([kind,count,delay]) =>
      Array.from({length:count}, () => ({kind,delay})))
    this.timer = 0
    this.next = 0
    this.wave++
    this.phase = 'running'
  }

  private effect(type:Effect['type'], p:Point, color:string, duration:number, radius=0, end?:Point) {
    this.effects.push({type,x:p.x,y:p.y,color,duration,life:duration,radius,end})
  }

  step(dt:number) {
    for (const effect of this.effects) effect.life -= dt
    this.effects = this.effects.filter(effect => effect.life > 0)
    if (this.phase !== 'running') return

    this.timer -= dt
    while (this.next < this.queue.length && this.timer <= 0) {
      const spawn = this.queue[this.next++]
      const maxHp = Math.round(enemies[spawn.kind].hp*armorByWave[this.wave-1])
      this.attackers.push({...route[0], kind:spawn.kind, hp:maxHp, maxHp, distance:0, angle:0})
      this.timer += spawn.delay
    }

    this.attackers = this.attackers.filter(enemy => {
      const data = enemies[enemy.kind]
      enemy.distance += data.speed*dt
      if (enemy.distance >= trackLength) {
        this.integrity = Math.max(0,this.integrity-data.leak)
        this.effect('blast',HQ,'#ff765d',.5,102)
        return false
      }
      let remaining = enemy.distance
      for (const segment of segments) {
        if (remaining <= segment.length) {
          enemy.x = segment.from.x + segment.dx*remaining/segment.length
          enemy.y = segment.from.y + segment.dy*remaining/segment.length
          enemy.angle = Math.atan2(segment.dy,segment.dx)
          break
        }
        remaining -= segment.length
      }
      return true
    })
    if (this.integrity === 0) {
      this.phase = 'lost'
      return
    }

    for (const tower of this.turrets) {
      const data = towers[tower.kind]
      tower.cooldown = Math.max(0,tower.cooldown-dt)
      let target: Enemy | undefined
      for (const enemy of this.attackers) {
        if (enemy.hp > 0 && distance(tower,enemy) <= data.range && (!target || enemy.distance > target.distance)) target = enemy
      }
      if (!target) continue
      tower.angle = Math.atan2(target.y-tower.y,target.x-tower.x)
      if (tower.cooldown > 0) continue

      tower.cooldown = data.interval
      this.effect('shot',tower,data.color,tower.kind === 'laser' ? .13 : .10, tower.kind === 'laser' ? 4 : 2,{x:target.x,y:target.y})
      if (data.splash) {
        for (const enemy of this.attackers) {
          if (distance(enemy,target) <= data.splash) enemy.hp -= data.damage
        }
        this.effect('blast',target,data.color,.37,data.splash)
      } else {
        target.hp -= data.damage
        this.effect('blast',target,data.color,.15,13)
      }
    }

    this.attackers = this.attackers.filter(enemy => {
      if (enemy.hp > 0) return true
      this.credits += enemies[enemy.kind].bounty
      this.effect('wreck',enemy,enemies[enemy.kind].color,.48,24)
      return false
    })

    if (this.next === this.queue.length && this.attackers.length === 0) {
      this.credits += 95 + this.wave*13
      this.phase = this.wave === waves.length ? 'won' : 'ready'
    }
  }
}
