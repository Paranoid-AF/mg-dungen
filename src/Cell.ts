import { Door } from "./Door"
import { Room } from "./Room"

export enum CellType {
  CELL_TYPE_EMPTY,
  CELL_TYPE_WALL,
  CELL_TYPE_ROOM,
  CELL_TYPE_DOOR,
  CELL_TYPE_LIFT,
}

export enum CellIcon {
  CELL_ICON_EMPTY = '.',
  CELL_ICON_WALL = 'w',
  CELL_ICON_DOOR = 'd',
  CELL_ICON_LIFT = 'E'
}

export class Cell {
  type: CellType = CellType.CELL_TYPE_EMPTY
  room: Room | null = null
  door: Door | null = null
}