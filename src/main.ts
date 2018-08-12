import data from './data.json'
import { City, Line, Station } from './dataInterface'
import * as Route from './route'
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

export const getCalcArg = (stationNames: string[], lineNames: string[]): Route.CalcArgument => {
  if (stationNames.length !== lineNames.length + 1) throw new ApplicationError('Length is wrong')
  const stationCanidates = stationNames.map(getStationsByName)
  const lineCanidates = lineNames.map(getLinesByName)
  let stations: (Station | null)[] = stationCanidates.map(s => (s.length === 1 ? s[0] : null))
  let lines: (Line | null)[] = lineCanidates.map(l => (l.length === 1 ? l[0] : null))
  for (let i = 0; i < lines.length; ++i) {
    if (stations[i] === null || lines[i] === null || stations[i + 1] === null) {
      l1: for (let s1 of stationCanidates[i]) {
        for (let l1 of lineCanidates[i]) {
          for (let s2 of stationCanidates[i + 1]) {
            if (l1.stationIds.includes(s1.id) && l1.stationIds.includes(s2.id)) {
              ;[stations[i], lines[i], stations[i + 1]] = [s1, l1, s2]
              ;[stationCanidates[i], lineCanidates[i], stationCanidates[i + 1]] = [[s1], [l1], [s2]]
              break l1
            }
          }
        }
      }
    }
  }

  let result: Route.CalcArgument = { stations: [], lines: [] }
  for (let s of stations) {
    if (s !== null) {
      result.stations.push(s)
    } else {
      throw new ApplicationError('invalid station')
    }
  }
  for (let l of lines) {
    if (l !== null) {
      result.lines.push(l)
    } else {
      throw new ApplicationError('invalid line')
    }
  }
  return result
}
