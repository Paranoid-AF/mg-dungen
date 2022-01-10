import { Grid } from "./Grid"
import { Room } from "./Room"
import { printGrid } from "./utils"

const grid = new Grid(40, 50)
const rooms = Array(100).fill(null).map(() => new Room(grid))
grid.placeRooms(rooms)
grid.generateDoorHoles()

// TODO: 将门插入到 grid 中

printGrid(grid)
console.log(`Placed ${grid.rooms.length} rooms, discarded ${rooms.length - grid.rooms.length} rooms.`)