import { enemies, HEIGHT, HQ, obstacles, PAD, ROAD, route, towers, WIDTH } from './data'
import type { Point, TowerKind } from './data'
import type { Game, Tower } from './game'

function circle(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,fill:string,stroke?:string) {
  ctx.beginPath()
  ctx.arc(x,y,r,0,2*Math.PI)
  ctx.fillStyle = fill
  ctx.fill()
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.stroke()
  }
}

function road(ctx:CanvasRenderingContext2D,width:number,color:string,dashes:number[] = []) {
  ctx.setLineDash(dashes)
  ctx.lineWidth = width
  ctx.strokeStyle = color
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(route[0].x,route[0].y)
  for (const point of route.slice(1)) ctx.lineTo(point.x,point.y)
  ctx.stroke()
  ctx.setLineDash([])
}

function terrain(ctx:CanvasRenderingContext2D) {
  const gradient = ctx.createLinearGradient(0,0,WIDTH,HEIGHT)
  gradient.addColorStop(0,'#3a4937')
  gradient.addColorStop(.55,'#29362b')
  gradient.addColorStop(1,'#44513a')
  ctx.fillStyle = gradient
  ctx.fillRect(0,0,WIDTH,HEIGHT)
  let seed = 2702
  const random = () => {
    seed = Math.imul(seed,1664525)+1013904223 | 0
    return (seed >>> 0) / 4294967296
  }
  for (let i=0;i<6500;i++) {
    ctx.fillStyle = i%2 ? '#d9da9620' : '#121a1970'
    ctx.fillRect(random()*WIDTH,random()*HEIGHT,1+random()*8,1+random()*3)
  }
  ctx.strokeStyle = '#b5c8a01b'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x=0;x<WIDTH;x+=40) { ctx.moveTo(x,0); ctx.lineTo(x,HEIGHT) }
  for (let y=0;y<HEIGHT;y+=40) { ctx.moveTo(0,y); ctx.lineTo(WIDTH,y) }
  ctx.stroke()
  road(ctx,ROAD+PAD*2,'#aeba8123')
  road(ctx,ROAD+9,'#242922')
  road(ctx,ROAD,'#9c9376')
  road(ctx,ROAD-8,'#50534d')
  road(ctx,2,'#d0c18c91',[20,20])
  for (const obstacle of obstacles) {
    const {x,y,w,h} = obstacle
    ctx.fillStyle = '#171f19a0'
    ctx.fillRect(x+6,y+7,w,h)
    ctx.fillStyle = '#34413b'
    ctx.fillRect(x,y,w,h)
    ctx.strokeStyle = '#85916d'
    ctx.strokeRect(x,y,w,h)
    for (let offset=8;offset<w-5;offset+=14) {
      ctx.fillStyle = '#6f7c6258'
      ctx.fillRect(x+offset,y+7,3,h-14)
    }
    ctx.fillStyle = '#e0e3be'
    ctx.font = 'bold 13px monospace'
    ctx.fillText('SPERRZONE',x+7,y+h/2+5)
  }

  ctx.fillStyle = '#382f24'
  ctx.fillRect(0,155,40,70)
  for (let i=0;i<3;i++) {
    const x=6+i*10
    ctx.strokeStyle = '#e7a765'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(x,177)
    ctx.lineTo(x+6,190)
    ctx.lineTo(x,203)
    ctx.stroke()
  }

}

export class Renderer {
  private ctx: CanvasRenderingContext2D
  private backdrop = document.createElement('canvas')

  constructor(canvas:HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!
    this.backdrop.width = WIDTH
    this.backdrop.height = HEIGHT
    terrain(this.backdrop.getContext('2d')!)
  }

  private turret(tower:Tower) {
    const ctx = this.ctx
    const {x,y,kind,angle} = tower
    ctx.lineWidth = 2
    circle(ctx,x+3,y+4,23,'#161b17a0')
    circle(ctx,x,y,22,'#4b554b','#929b82')
    circle(ctx,x,y,16,'#282f2d','#67716a')
    ctx.save()
    ctx.translate(x,y)
    ctx.rotate(angle)
    ctx.fillStyle = '#a2a89a'
    if (kind === 'rocket') {
      ctx.fillRect(1,-10,26,8)
      ctx.fillRect(1,2,26,8)
    } else {
      ctx.fillRect(5,-3,25,6)
    }
    ctx.fillStyle = '#596551'
    ctx.fillRect(-12,-10,24,20)
    ctx.fillStyle = '#a1ab91'
    ctx.fillRect(-11,-10,18,3)
    ctx.fillStyle = towers[kind].color
    ctx.fillRect(-8,-4,7,8)
    ctx.restore()
  }

  draw(game:Game,selected:TowerKind|null,point:Point|null) {
    const ctx = this.ctx
    ctx.drawImage(this.backdrop,0,0)
    const {x,y} = HQ
    ctx.lineWidth = 2
    circle(ctx,x,y,110,'#688c6b23','#9fb68a55')
    ctx.fillStyle = '#171e1a'
    ctx.fillRect(x-58,y-43,125,94)
    ctx.fillStyle = '#74816d'
    ctx.fillRect(x-61,y-47,122,94)
    ctx.strokeStyle = '#a6b096'
    ctx.strokeRect(x-61,y-47,122,94)
    ctx.fillStyle = '#34413b'
    ctx.fillRect(x-43,y-34,84,68)
    for (const dy of [-34,23]) {
      ctx.fillStyle = '#586a5c'
      ctx.fillRect(x-43,y+dy,84,10)
    }
    ctx.fillStyle = game.integrity ? '#bce7aa' : '#fa8c73'
    ctx.fillRect(x-59,y-13,7,26)


    if (selected && point) {
      const invalid = game.placement(point,selected)
      const color = invalid ? '#ff9b7e' : towers[selected].color
      ctx.lineWidth = 2
      circle(ctx,point.x,point.y,towers[selected].range,color+'24',color)
      circle(ctx,point.x,point.y,PAD,color+'50',color)
    }
    for (const tower of game.turrets) this.turret(tower)
    for (const enemy of game.attackers) {
      const {x,y,angle,kind,hp,maxHp} = enemy
      const data = enemies[kind]
      ctx.save()
      ctx.translate(x,y)
      ctx.rotate(angle)
      ctx.fillStyle = '#192020'
      if (kind === 'crawler') {
        ctx.fillRect(-16,-14,31,8)
        ctx.fillRect(-16,6,31,8)
        ctx.fillStyle = '#a28174'
        ctx.fillRect(-12,-9,25,18)
        ctx.fillStyle = '#534648'
        ctx.fillRect(-10,-6,12,12)
      } else {
        ctx.beginPath()
        ctx.moveTo(17,0)
        ctx.lineTo(-10,-13)
        ctx.lineTo(-5,0)
        ctx.lineTo(-10,13)
        ctx.closePath()
        ctx.fill()
        ctx.strokeStyle = '#e3c787'
        ctx.lineWidth = 2
        ctx.stroke()
      }
      ctx.fillStyle = data.color
      ctx.fillRect(5,-3,6,6)
      ctx.restore()
      if (hp < maxHp) {
        ctx.fillStyle = '#1a1918'
        ctx.fillRect(x-13,y-21,26,4)
        ctx.fillStyle = data.color
        ctx.fillRect(x-13,y-21,26*hp/maxHp,4)
      }
    }
    for (const effect of game.effects) {
      const progress = 1-effect.life/effect.duration
      ctx.globalAlpha = 1-progress
      ctx.lineWidth = effect.radius < 5 ? effect.radius : 2
      if (effect.end) {
        ctx.strokeStyle = effect.color
        ctx.beginPath()
        ctx.moveTo(effect.x,effect.y)
        ctx.lineTo(effect.end.x,effect.end.y)
        ctx.stroke()
      } else if (effect.type === 'wreck') {
        circle(ctx,effect.x,effect.y,7+progress*19,'#202720a0')
        for(let i=0;i<7;i++) {
          const angle = i*Math.PI*2/7
          circle(ctx,effect.x+Math.cos(angle)*progress*32,effect.y+Math.sin(angle)*progress*32,2,effect.color)
        }
      } else {
        circle(ctx,effect.x,effect.y,3+progress*effect.radius,effect.color+'33',effect.color)
      }
    }
    ctx.globalAlpha = 1
  }
}
