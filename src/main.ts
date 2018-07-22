import data from './data.json'
import { City, Line, Station } from './dataInterface'
import 'core-js'
export class ApplicationError implements Error {
  public name = 'ApplicationError'
  constructor(public message: string) {}
  toString() {
    return this.name + ': ' + this.message
  }
}
export function getStationsByName(stationName: string): Station[] {
  if (stationName === '') return data.stations
  return data.stations.filter(s => s.name.includes(stationName))
}
export function getStationByName(stationName: string): Station {
  let stationId = data.stationNames.indexOf(stationName)
  if (stationId === -1) {
    const sugStations = getStationsByName(stationName)
    if (sugStations.length > 0) {
      stationId = sugStations[0].id
    } else {
      throw new ApplicationError('Unknown Station')
    }
  }
  return data.stations[stationId]
}
export function getStationsByLineAndName(lineName: string, stationName: string): Station[] {
  return data.lines
    .filter(l => l.name.includes(lineName))
    .map(l => l.stationIds)
    .flatten()
    .map(id => data.stations[id])
    .filter(s => s.name.includes(stationName))
}
export function getStationByLineAndName(lineName: string, stationName: string): Station {
  let stations = getStationsByLineAndName(lineName, stationName)
  if (stations.length > 0) {
    return stations[0]
  } else {
    throw new ApplicationError('Unknown Station')
  }
}
