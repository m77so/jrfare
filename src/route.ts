import data from './data.json'
import {
  Line,
  Station,
  EdgeOwner,
  JRCompanies,
  JRChihoCompanies,
  JRHondoCompanies,
  ChihoJR,
  HondoJR,
  GroupJR
} from './dataInterface'
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
    this.companies = this.companies.concat(target.companies).filter((x, i, self) => self.indexOf(x) === i)
    this.operationDKm += target.operationDKm
    this.convertedDKm += target.convertedDKm
    this.kansen = this.kansen || target.kansen
    this.local = this.local || target.local
  }
  addOneSection(line: Line, startIndex: number) {
    const subOperationdkm = Math.abs(line.kms[startIndex] - line.kms[startIndex + 1])
    this.operationDKm += subOperationdkm
    if (line.local) {
      this.convertedDKm += Math.abs(line.akms[startIndex] - line.akms[startIndex + 1])
      this.local = true
    } else {
      this.convertedDKm += subOperationdkm
      this.kansen = true
    }
  }
}
class EdgeDistanceArray extends Array<EdgeDistance> {
  get companies() {
    return this.flatMap(ed => ed.companies)
      .filter((c => (JRCompanies as EdgeOwner[]).includes(c)) as ((c: EdgeOwner) => c is GroupJR))
      .filter((x, i, self) => self.indexOf(x) === i)
  }
  get intersectionEdgeOwner() {
    return this.map(ed => ed.companies).reduce((p, c) => p.concat(c).filter((v, i, s) => s.indexOf(v) !== i))
  }
  get sumOperationDKm() {
    return this.map(ed => ed.operationDKm).reduce((p, c) => p + c, 0)
  }
  get sumOperationFareKm() {
    return Math.ceil(this.sumOperationDKm / 10)
  }
  get sumConvertedDKm() {
    return this.map(ed => ed.convertedDKm).reduce((p, c) => p + c, 0)
  }
  get sumConvertedFareKm() {
    return Math.ceil(this.sumConvertedDKm / 10)
  }
  private flatmapOnly(arg: (ed: EdgeDistance) => boolean) {
    return this.flatMap(arg).filter(k => k === false).length === 0
  }
  get onlyLocal() {
    return this.flatmapOnly(ed => ed.local)
  }
  get onlyKansen() {
    return this.flatmapOnly(ed => ed.kansen)
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
const getDistance = (calcArg: CalcArgument): EdgeDistanceArray => {
  const stations = calcArg.stations
  const lines = calcArg.lines
  const result = new EdgeDistanceArray()
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
      result[result.length - 1].addOneSection(targetLine, j)
    }
  }
  return result
}
const hondoCalc = (edgeDistances: EdgeDistanceArray): number => {
  const intersectionEdgeOwner = edgeDistances.intersectionEdgeOwner
  let result = 0
  if (intersectionEdgeOwner.includes(EdgeOwner.TYOJY)) {
    result = Fare.yamanote(edgeDistances.sumOperationFareKm)
  } else if (intersectionEdgeOwner.includes(EdgeOwner.OSALL)) {
    result = Fare.osakaKanjo(edgeDistances.sumOperationFareKm)
  } else if (intersectionEdgeOwner.includes(EdgeOwner.TYOSPC)) {
    result = Fare.tokyoSpecificSection(edgeDistances.sumOperationFareKm)
  } else if (intersectionEdgeOwner.includes(EdgeOwner.OSASPC)) {
    result = Fare.osakaSpecificSection(edgeDistances.sumOperationFareKm)
  } else if (edgeDistances.onlyLocal) {
    result = Fare.hondoLocal(edgeDistances.sumOperationFareKm)
  } else {
    result = Fare.hondoKansen(edgeDistances.sumConvertedFareKm)
  }
  return result
}
const chihoCalc = (edgeDistances: EdgeDistanceArray, company: ChihoJR): number => {
  let result = 0

  if (company === EdgeOwner.JRQ || company === EdgeOwner.JRS) {
    type LocalFunctionType = ((a1: number, a2: number) => number)
    type KansenFunctionType = (a1: number) => number
    let localFunction: LocalFunctionType = company === EdgeOwner.JRQ ? Fare.kyushuLocal : Fare.shikokuLocal
    let kansenFunction: KansenFunctionType = company === EdgeOwner.JRQ ? Fare.kyushuKansen : Fare.shikokuKansen
    if (edgeDistances.onlyKansen) {
      result = kansenFunction(edgeDistances.sumOperationFareKm)
    } else {
      result = localFunction(edgeDistances.sumConvertedFareKm, edgeDistances.sumOperationFareKm)
    }
  } else if (company === EdgeOwner.JRH) {
    if (edgeDistances.onlyLocal) {
      result = Fare.hokkaidoLocal(edgeDistances.sumOperationFareKm)
    } else {
      result = Fare.hokkaidoKansen(edgeDistances.sumConvertedFareKm)
    }
  } else {
    throw new ApplicationError('company should be chiho companies.')
  }
  return result
}
export const calc = (calcArg: CalcArgument): CalcResponse => {
  routeValidity(calcArg)
  const routeDistance = getDistance(calcArg)
  const companies = routeDistance.companies
  const hondoCompanies = companies.filter((c => (JRHondoCompanies as GroupJR[]).includes(c)) as ((
    c: GroupJR
  ) => c is HondoJR))
  const companies0 = companies[0]
  const resultDistanceResponse = new EdgeDistance(companies)
  for (let rd of routeDistance) resultDistanceResponse.merge(rd)
  resultDistanceResponse.companies = companies

  let resultFare = 0
  let additionalFare = 0
  if (hondoCompanies.length > 0 && hondoCompanies.length === companies.length) {
    resultFare = hondoCalc(routeDistance)
  } else if (
    hondoCompanies.length === 0 &&
    (companies0 === EdgeOwner.JRQ || companies0 === EdgeOwner.JRS || companies0 === EdgeOwner.JRH)
  ) {
    resultFare = chihoCalc(routeDistance, companies0)
  } else {
    // Cross company fare
    const additionalEdgeDistance: { [index in ChihoJR]: EdgeDistanceArray } = {
      [EdgeOwner.JRQ]: new EdgeDistanceArray(),
      [EdgeOwner.JRS]: new EdgeDistanceArray(),
      [EdgeOwner.JRH]: new EdgeDistanceArray()
    }
    for (let rd of routeDistance) {
      const chihoCompanies: ChihoJR[] = rd.companies.filter((c => (JRChihoCompanies as EdgeOwner[]).includes(c)) as ((
        c: EdgeOwner
      ) => c is ChihoJR))
      if (chihoCompanies.length === 1) {
        additionalEdgeDistance[chihoCompanies[0]].push(rd)
      }
    }
    for (let chihoCompany of JRChihoCompanies) {
      let targetEDs = additionalEdgeDistance[chihoCompany]
      if (targetEDs.length > 0) {
        additionalFare += chihoCalc(targetEDs, chihoCompany) - hondoCalc(targetEDs)
      }
    }
    resultFare = hondoCalc(routeDistance)
  }
  resultFare += additionalFare
  return { fare: resultFare, distanceResponse: resultDistanceResponse }
}
