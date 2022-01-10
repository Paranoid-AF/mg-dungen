import { Room } from "./Room"

export enum DoorType {
  DOOR_TYPE_GATE,
  DOOR_TYPE_AIR,
}

export class Door {
  x: number = -1
  y: number = -1
  room1: Room | null = null
  room2: Room | null = null

  type: DoorType = DoorType.DOOR_TYPE_GATE

  public getOtherRoom(room: Room) {
    return this.room1 !== room ? this.room1 : this.room2
  }
}