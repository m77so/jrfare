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
    if (sugStations.length === 1) {
      stationId = sugStations[0].id
    } else {
      throw new ApplicationError(`${stationName} is Unknown Station`)
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
const getLinesByName = (lineName: string): Line[] => {
  // if (lineName === '') return data.lines
  return data.lines.filter(s => s.name.includes(lineName))
}
export const getLineByName = (lineName: string): Line => {
  let lineId = data.lineNames.indexOf(lineName)
  if (lineId === -1) {
    const sugLines = getLinesByName(lineName)
    if (sugLines.length === 1) {
      lineId = sugLines[0].id
    } else {
      throw new ApplicationError('Unknown Line')
    }
  }
  return data.lines[lineId]
}

const getLinesByStationAndName = (lineName: string, stationName: string): Line[] => {
  return getStationsByName(stationName)
    .map(l => l.lineIds)
    .flatten()
    .map(id => data.lines[id])
    .filter(s => s.name.includes(lineName))
}

export const getLineByStationAndName = (lineName: string, stationName: string): Line => {
  let lines = getLinesByStationAndName(lineName, stationName)
  if (lines.length > 0) {
    return lines[0]
  } else {
    throw new ApplicationError('Unknown Line')
  }
}
