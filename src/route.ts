import data from './data.json'
import { City, Line, Station, EdgeOwner, JRCompanies } from './dataInterface'
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
  companies: EdgeOwner[]
  kansen: boolean
  local: boolean
}
interface EdgeDistanceInterface {}
class EdgeDistance {
  companies: EdgeOwner[]
  operationDKm: number
  convertedDKm: number
  get operationFareKm() {
    return Math.ceil(this.operationDKm / 10)
  }
  get convertedFareKm() {
    return Math.ceil(this.convertedDKm / 10)
  }
  kansen: boolean
  local: boolean
  constructor(companies: EdgeOwner[]) {
    this.companies = companies
    this.operationDKm = 0
    this.convertedDKm = 0
    this.kansen = false
    this.local = false
  }
  merge(target: EdgeDistance) {
    this.companies.concat(target.companies).filter((x, i, self) => self.indexOf(x) === i)
    this.operationDKm += target.operationDKm
    this.convertedDKm += target.convertedDKm
    this.kansen = this.kansen || target.kansen
    this.local = this.local || target.local
  }
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
const getDistance = (calcArg: CalcArgument): EdgeDistance[] => {
  const stations = calcArg.stations
  const lines = calcArg.lines
  const result: EdgeDistance[] = []
  let currentEdgeGroup: EdgeOwner[] = []
  for (let i = 0; i < lines.length; ++i) {
    const targetLine = lines[i]
    const startStationIndex = targetLine.stationIds.indexOf(stations[i].id)
    const endStationIndex = targetLine.stationIds.indexOf(stations[i + 1].id)
    const jAsc = startStationIndex < endStationIndex
    for (
      let j = startStationIndex + (jAsc ? 0 : -1);
      jAsc ? j < endStationIndex : j >= endStationIndex;
      jAsc ? j++ : j--
    ) {
      const edgeGroup = targetLine.edgeGroup[j]

      if (currentEdgeGroup.join(':') !== edgeGroup.join(':')) {
        result.push(new EdgeDistance(edgeGroup))
        currentEdgeGroup = edgeGroup
      }
      const resultLast = result[result.length - 1]
      const subOperationdkm = Math.abs(targetLine.kms[j] - targetLine.kms[j + 1])
      resultLast.operationDKm += subOperationdkm
      if (targetLine.local) {
        let subConverteddkm = Math.abs(targetLine.akms[j] - targetLine.akms[j + 1])
        resultLast.convertedDKm += subConverteddkm
        resultLast.local = true
      } else {
        resultLast.convertedDKm += subOperationdkm
        resultLast.kansen = true
      }
    }
  }

  return result
}

export const calc = (calcArg: CalcArgument): CalcResponse => {
  routeValidity(calcArg)
  const routeDistance = getDistance(calcArg)
  const companies = routeDistance
    .flatMap(ed => ed.companies)
    .filter(c => JRCompanies.includes(c))
    .filter((x, i, self) => self.indexOf(x) === i)
  const hondoCompanies = companies.filter(c => [EdgeOwner.JRC, EdgeOwner.JRE, EdgeOwner.JRW].includes(c))
  const resultDistanceResponse = new EdgeDistance(companies)
  for (let rd of routeDistance) resultDistanceResponse.merge(rd)
  resultDistanceResponse.companies = companies

  let resultFare = 0
  if (hondoCompanies.length > 0 && hondoCompanies.length === companies.length) {
    if (resultDistanceResponse.kansen) {
      resultFare = Fare.hondoKansen(resultDistanceResponse.convertedFareKm)
    } else {
      resultFare = Fare.hondoLocal(resultDistanceResponse.operationFareKm)
    }
  } else if (resultDistanceResponse.companies.includes(EdgeOwner.JRQ)) {
    if (resultDistanceResponse.local) {
      resultFare = Fare.kyushuLocal(resultDistanceResponse.convertedFareKm, resultDistanceResponse.operationFareKm)
    } else {
      resultFare = Fare.kyushuKansen(resultDistanceResponse.operationFareKm)
    }
  } else if (resultDistanceResponse.companies.includes(EdgeOwner.JRS)) {
    if (resultDistanceResponse.local) {
      resultFare = Fare.shikokuLocal(resultDistanceResponse.convertedFareKm, resultDistanceResponse.operationFareKm)
    } else {
      resultFare = Fare.shikokuKansen(resultDistanceResponse.operationFareKm)
    }
  } else {
    // JRH
    if (resultDistanceResponse.kansen) {
      resultFare = Fare.hokkaidoKansen(resultDistanceResponse.convertedFareKm)
    } else {
      resultFare = Fare.hokkaidoLocal(resultDistanceResponse.operationFareKm)
    }
  }

  return { fare: resultFare, distanceResponse: resultDistanceResponse }
}
