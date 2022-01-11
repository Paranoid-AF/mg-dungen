import { Cell, CellType } from "./Cell"
import { Door } from "./Door"
import { Room } from "./Room"
import { randInclusive } from "./utils"

export const WALL_SIZE = 1

export class Grid {
  width: number
  height: number
  rooms: Room[] = []

  cells: Array<Cell[]>

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  
    this.cells = this.generateCells(width, height)
  }

  private generateCells(width: number, height: number) {
    return Array(width).fill(null).map(() => (
        Array(height).fill(null).map(() => (new Cell()))
      )
    )
  }

  private pickInitialPosition(room: Room) {
    let minX = WALL_SIZE
    let minY = WALL_SIZE
    let maxX = this.width - room.width - WALL_SIZE
    let maxY = this.height - room.height - WALL_SIZE
  
    // 起始点从 grid 的四个边界上取
    switch(randInclusive(1, 4)) {
      case 1:
        return {
          x: maxX,
          y: randInclusive(minY, maxY),
        }
      case 2:
        return {
          x: randInclusive(minX, maxX),
          y: maxY,
        }
      case 3:
        return {
          x: maxX,
          y: randInclusive(minY, maxY),
        }
      case 4:
      default:
        return {
          x: randInclusive(minX, maxX),
          y: maxY,
        }
    }
  }

  private checkRoomOverlap(roomX: number, roomY: number, roomWidth: number, roomHeight: number) {
    // 碰到边缘也是不行的
    if(roomX <= 0 || roomY <= 0) {
      return true
    }
    if(roomX + roomWidth - 1 >= this.width - 1) {
      return true
    }
    if(roomY + roomHeight - 1 >= this.height - 1) {
      return true
    }
    // 不能在 grid 上有重合
    for(let i=0; i<roomWidth; i++) {
      for(let j=0; j<roomHeight; j++) {
        const x = roomX + i
        const y = roomY + j
        if(this.cells[x][y].type !== CellType.CELL_TYPE_EMPTY) {
          return true
        }
      }
    }
    return false
  }

  private findPossibleRoomPositions(prevRoom: Room, room: Room) {
    const points = []
    // 左侧滑动
    {
      const x = prevRoom.x - room.width - WALL_SIZE
      const minY = prevRoom.y - room.height + 1
      const maxY = prevRoom.y + prevRoom.height - 1
      for(let y=minY; y<=maxY; y++) {
        points.push({ x, y, type: 'LEFTWARD' })
      }
    }
    // 右侧滑动
    {
      const x = prevRoom.x + prevRoom.width + WALL_SIZE
      const minY = prevRoom.y - room.height + 1
      const maxY = prevRoom.y + prevRoom.height - 1
      for(let y=minY; y<=maxY; y++) {
        points.push({ x, y, type: 'RIGHTWARD' })
      }
    }
    // 上方滑动
    {
      const y = prevRoom.y - room.height - WALL_SIZE
      const minX = prevRoom.x - room.width + 1
      const maxX = prevRoom.x + prevRoom.width - 1
      for(let x=minX; x<=maxX; x++) {
        points.push({ x, y, type: 'UPWARD' })
      }
    }
    // 下方滑动
    {
      const y = prevRoom.y + prevRoom.height + WALL_SIZE
      const minX = prevRoom.x - room.width + 1
      const maxX = prevRoom.x + prevRoom.width - 1
      for(let x=minX; x<=maxX; x++) {
        points.push({ x, y, type: 'DOWNWARD' })
      }
    }
    return points.filter((point) => (
      !this.checkRoomOverlap(point.x, point.y, room.width, room.height)
    ))
  }

  private placeRoomsOnePass(rooms: Room[], prevRoom: Room | null) {
    const ignored: Room[] = []
    const placed: Room[] = []
  
    rooms.forEach(room => {
      if(prevRoom) {
        const positions = this.findPossibleRoomPositions(prevRoom, room)
  
        if(positions.length > 0) {
          const pos = positions[randInclusive(0, positions.length - 1)]
          room.x = pos.x
          room.y = pos.y
          prevRoom = room
          placed.push(room)
        } else {
          ignored.push(room)
        }
      } else {
        const initialPos = this.pickInitialPosition(room)
        room.x = initialPos.x
        room.y = initialPos.y
        prevRoom = room
        placed.push(room)
      }
  
      // 放置后，在 grid 中绘制，以用于各类快速检测。
      room.drawInGrid()
    })
  
    return {
      ignored,
      placed,
    }
  }

  private buildDoorHole(room: Room, x: number, y: number, offsetX: number, offsetY: number) {
    if(this.isInGrid(x + offsetX, y + offsetY)) {
      const neighbor = this.cells[x + offsetX][y + offsetY]
      if(neighbor.type === CellType.CELL_TYPE_ROOM) {
        const neighborRoom = neighbor.room
        if(neighborRoom) {
          // 如果有重复的门就忽略，避免同一个门在不同房间遍历时被添加两次。
          if(room.doorHoles.has(neighborRoom)) {
            const existingDoorHoles = room.doorHoles.get(neighborRoom)
            if(existingDoorHoles && existingDoorHoles.find(door => door.x === x && door.y === y)) {
              return null
            }
          }

          const door = new Door()
          door.x = x
          door.y = y
  
          door.connectRooms(room, neighborRoom)
          
          return door
        }
      }
    }
    return null
  }

  /**
   * 向方格中放入房间。
   * 注意：由于空间限制，不是所有房间都会被放置，会有部分丢弃。可以通过 this.room 得到实际放入的房间。
   * @param rooms 
   */
  public placeRooms(rooms: Room[]) {
    let lastTrial = this.placeRoomsOnePass(rooms, null)
    const placedQueue = lastTrial.placed // 用于贪心尝试的队列。作为 prevRoom 拼不上的房间将会出队。
    this.rooms.push(...placedQueue) // 记录已经拼接成功的房间
    while(lastTrial.ignored.length > 0) {
      const trial = this.placeRoomsOnePass(lastTrial.ignored, placedQueue[0])
      placedQueue.push(...trial.placed)
      this.rooms.push(...trial.placed)
      if(trial.ignored.length === lastTrial.ignored.length) {
        placedQueue.shift()
      }
      
      if(placedQueue.length === 0) {
        break
      }
      lastTrial = trial
    }
  }

  public generateDoorHoles() {
    if(!this.rooms) {
      throw new Error('No rooms placed!')
    }
    this.rooms.forEach(room => {
      // 水平遍历墙壁，发现已经有通往同一房间的门就跳过
      for(let i=0; i<room.width; i++) {
        const x = room.x + i
        const topY = room.y
        const bottomY = room.y + room.height - 1
        const top = this.buildDoorHole(room, x, topY - WALL_SIZE, 0, -1)
        const bottom = this.buildDoorHole(room, x, bottomY + WALL_SIZE, 0, 1)
        if(top) {
          const otherRoom = top.getOtherRoom(room)
          if(otherRoom) {
            room.connectedEdges.top = true
            otherRoom.connectedEdges.bottom = true
          }
        }
        if(bottom) {
          const otherRoom = bottom.getOtherRoom(room)
          if(otherRoom) {
            room.connectedEdges.bottom = true
            otherRoom.connectedEdges.top = true
          }
        }
      }
      // 垂直遍历墙壁，同上
      for(let i=0; i<room.height; i++) {
        const y = room.y + i
        const leftX = room.x
        const rightX = room.x + room.width - 1
        const left = this.buildDoorHole(room, leftX - WALL_SIZE, y, -1, 0)
        const right = this.buildDoorHole(room, rightX + WALL_SIZE, y, 1, 0)
        if(left) {
          const otherRoom = left.getOtherRoom(room)
          if(otherRoom) {
            room.connectedEdges.left = true
            otherRoom.connectedEdges.right = true
          }
        }
        if(right) {
          const otherRoom = right.getOtherRoom(room)
          if(otherRoom) {
            room.connectedEdges.right = true
            otherRoom.connectedEdges.left = true
          }
        }
      }
    })
  }

  public isInGrid(x: number, y: number) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height
  }
}
