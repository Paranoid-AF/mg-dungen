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

  public connectRooms(room1: Room, room2: Room) {
    this.room1 = room1
    this.room2 = room2

    if(room1.doorHoles.has(room2)) {
      const doors = room1.doorHoles.get(room2)
      if(doors) {
        doors.push(this)
      }
    } else {
      room1.doorHoles.set(room2, [ this ])
    }

    if(room2.doorHoles.has(room1)) {
      const doors = room2.doorHoles.get(room1)
      if(doors) {
        doors.push(this)
      }
    } else {
      room2.doorHoles.set(room1, [ this ])
    }
  }

  public disconnectRooms() {
    if(!this.room1 || !this.room2) {
      return
    }

    if(this.room1.doorHoles.has(this.room2)) {
      this.room1.doorHoles.delete(this.room2)
    }

    if(this.room2.doorHoles.has(this.room1)) {
      this.room2.doorHoles.delete(this.room1)
    }
  }
}