import { CellIcon, CellType } from "./Cell"
import { Grid } from "./Grid"

export function randInclusive(min: number, max: number) {
  // 双闭区间
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function printGrid(grid: Grid) {
  const { width, height } = grid

  const transposed = Array(height).fill(null).map(() => (
    Array(width).fill(CellIcon.CELL_ICON_EMPTY))
  )
  for(let x=0; x<width; x++) {
    for(let y=0; y<height; y++) {
      const cell = grid.cells[x][y]
      transposed[y][x] = CellIcon.CELL_ICON_EMPTY
      if(cell.type === CellType.CELL_TYPE_WALL) {
        transposed[y][x] = CellIcon.CELL_ICON_WALL
      }
      if(cell.type === CellType.CELL_TYPE_ROOM) {
        if(cell.room) {
          transposed[y][x] = cell.room.id
        }
      }
      if(cell.type === CellType.CELL_TYPE_DOOR) {
        transposed[y][x] = CellIcon.CELL_ICON_DOOR
      }
    }
  }
  console.table(transposed)
}