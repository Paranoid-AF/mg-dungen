import { CellType } from './Cell'
import { Door } from './Door'
import { Grid, WALL_SIZE } from './Grid'
import { randInclusive } from './utils'

const ROOM_MIN = 2
const ROOM_MAX = 5

let counter = 1

interface EdgeConnection {
  top: boolean,
  bottom: boolean,
  left: boolean,
  right: boolean,
}

export class Room {
  grid: Grid
  id: number

  width: number
  height: number

  doorHoles: Map<Room, Door[]>
  connectedEdges: EdgeConnection

  x: number = -1
  y: number = -1

  constructor(grid: Grid) {
    this.grid = grid
  
    this.id = counter
    counter += 1

    this.width = randInclusive(ROOM_MIN, ROOM_MAX)
    this.height = randInclusive(ROOM_MIN, ROOM_MAX)

    this.doorHoles = new Map()
    this.connectedEdges = {
      top: false,
      bottom: false,
      left: false,
      right: false,
    }
  }

  public addDoorHole(door: Door) {
    if(!door.room1 || !door.room2) {
      return
    }
    if(door.room2.doorHoles.has(door.room1)) {
      const doors = door.room2.doorHoles.get(door.room1)
      if(doors) {
        doors.push(door)
      }
    } else {
      door.room2.doorHoles.set(door.room1, [ door ])
    }

    if(door.room1.doorHoles.has(door.room2)) {
      const doors = door.room1.doorHoles.get(door.room2)
      if(doors) {
        doors.push(door)
      }
    } else {
      door.room1.doorHoles.set(door.room2, [ door ])
    }
  }

  public drawInGrid() {
    // 如果房间没有被放置 (即位置在默认的 -1)，则跳过。
    if(this.x >= 0 && this.y >= 0) {
      for(let i=-WALL_SIZE; i<this.width + WALL_SIZE; i++) {
        for(let j=-WALL_SIZE; j<this.height + WALL_SIZE; j++) {
          const cellX = this.x + i
          const cellY = this.y + j
          if(!this.grid.isInGrid(cellX, cellY)) {
            continue
          }
          if(i < 0 || i >= this.width || j < 0 || j >= this.height) {
            if(this.grid.cells[cellX][cellY].type === CellType.CELL_TYPE_EMPTY) {
              this.grid.cells[cellX][cellY].type = CellType.CELL_TYPE_WALL
            }
          } else {
            this.grid.cells[cellX][cellY].type = CellType.CELL_TYPE_ROOM
            this.grid.cells[cellX][cellY].room = this
          }
        }
      }
    }
  }

  // TODO: Implement these.
  public drawDoors() {

  }

  public drawDecals() {

  }
}