import data from './data.json'
import { City, Line, Station, Companies } from './dataInterface'
import { ApplicationError } from './main'
import * as Fare from './fare'
export interface CalcArgument {
  stations: Station[]
  lines: Line[]
}
export interface CalcResponse {
  fare: number
  distanceResponse: DistanceResponse
}

interface DistanceResponse {
  operationDKm: number
  convertedDKm: number
  operationFareKm: number
  convertedFareKm: number
  companies: Companies[]
  kansen: boolean
  local: boolean
}
const routeValidity = (calcArg: CalcArgument) => {
  const stations = calcArg.stations
  const lines = calcArg.lines
  // Easy Line Validation Check
  let valid = true
  for (let i = 0; i < lines.length && valid; ++i) {
    valid = stations[i].lineIds.includes(lines[i].id) && stations[i + 1].lineIds.includes(lines[i].id)
  }
  if (!valid) {
    throw new ApplicationError('The route is not connected')
  }
}
const getDistance = (calcArg: CalcArgument): DistanceResponse => {
  const stations = calcArg.stations
  const lines = calcArg.lines
  const result: DistanceResponse = {
    operationDKm: 0,
    convertedDKm: 0,
    operationFareKm: 0,
    convertedFareKm: 0,
    companies: [],
    kansen: false,
    local: false
  }
  for (let i = 0; i < lines.length; ++i) {
    const targetLine = lines[i]
    const startStationIndex = targetLine.stationIds.indexOf(stations[i].id)
    const endStationIndex = targetLine.stationIds.indexOf(stations[i + 1].id)
    const subOperationdkm = Math.abs(targetLine.kms[startStationIndex] - targetLine.kms[endStationIndex])
    result.operationDKm += subOperationdkm
    if (targetLine.local) {
      let subConverteddkm = Math.abs(targetLine.akms[startStationIndex] - targetLine.akms[endStationIndex])
      result.convertedDKm += subConverteddkm
      result.local = true
    } else {
      result.convertedDKm += subOperationdkm
      result.kansen = true
    }
  }
  // rough check
  for (let station of stations) {
    if (station.company.length === 1 && !result.companies.includes(station.company[0])) {
      result.companies.push(station.company[0])
    }
  }
  result.operationFareKm = Math.ceil(result.operationDKm / 10)
  result.convertedFareKm = Math.ceil(result.convertedDKm / 10)
  return result
}

export const calc = (calcArg: CalcArgument): CalcResponse => {
  routeValidity(calcArg)
  const routeDistance = getDistance(calcArg)
  let resultFare = 0
  if (
    routeDistance.companies.includes(Companies.JRC) ||
    routeDistance.companies.includes(Companies.JRE) ||
    routeDistance.companies.includes(Companies.JRW)
  ) {
    if (routeDistance.kansen) {
      resultFare = Fare.hondoKansen(routeDistance.convertedFareKm)
    } else {
      resultFare = Fare.hondoLocal(routeDistance.operationFareKm)
    }
  } else if (routeDistance.companies.includes(Companies.JRQ)) {
    if (routeDistance.local) {
      resultFare = Fare.kyushuLocal(routeDistance.convertedFareKm, routeDistance.operationFareKm)
    } else {
      resultFare = Fare.kyushuKansen(routeDistance.operationFareKm)
    }
  } else if (routeDistance.companies.includes(Companies.JRS)) {
    if (routeDistance.local) {
      resultFare = Fare.shikokuLocal(routeDistance.convertedFareKm, routeDistance.operationFareKm)
    } else {
      resultFare = Fare.shikokuKansen(routeDistance.operationFareKm)
    }
  } else {
    // JRH
    if (routeDistance.kansen) {
      resultFare = Fare.hokkaidoKansen(routeDistance.convertedFareKm)
    } else {
      resultFare = Fare.hokkaidoLocal(routeDistance.operationFareKm)
    }
  }

  return { fare: resultFare, distanceResponse: routeDistance }
}
