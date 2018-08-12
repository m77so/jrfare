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
  unionEdgeOwner() {
    return this.flatMap(ed => ed.companies).filter((x, i, self) => self.indexOf(x) === i)
  }
  get lastItem() {
    return this[this.length - 1]
  }
  get companies() {
    return this.unionEdgeOwner().filter((c => (JRCompanies as EdgeOwner[]).includes(c)) as ((
      c: EdgeOwner
    ) => c is GroupJR))
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
      if (
        result.length === 0 ||
        result.lastItem.companies.join(':') !== edgeGroup.join(':') ||
        result.lastItem.local !== targetLine.local ||
        result.lastItem.kansen === targetLine.local
      ) {
        result.push(new EdgeDistance(edgeGroup))
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
  } else if (edgeDistances.onlyKansen) {
    result = Fare.hondoKansen(edgeDistances.sumConvertedFareKm)
  } else {
    result = Fare.hondoCross(edgeDistances.sumConvertedFareKm, edgeDistances.sumOperationFareKm)
  }
  return result
}
const santoCalc = (edgeDistances: EdgeDistanceArray, company: ChihoJR): number => {
  let result = 0

  type LocalFunctionType = ((a1: number, a2: number) => number)
  type KansenFunctionType = (a1: number) => number
  let localFunction: LocalFunctionType
  let kansenFunction: KansenFunctionType
  let crossFunction: LocalFunctionType
  if (company === EdgeOwner.JRQ) {
    ;[localFunction, kansenFunction, crossFunction] = [Fare.kyushuLocal, Fare.kyushuKansen, Fare.kyushuCross]
  } else if (company === EdgeOwner.JRS) {
    ;[localFunction, kansenFunction, crossFunction] = [Fare.shikokuLocal, Fare.shikokuKansen, Fare.shikokuCross]
  } else {
    ;[localFunction, kansenFunction, crossFunction] = [Fare.hokkaidoLocal, Fare.hokkaidoKansen, Fare.hokkaidoCross]
  }
  if (edgeDistances.onlyKansen) {
    result = kansenFunction(edgeDistances.sumOperationFareKm)
  } else if (edgeDistances.onlyLocal) {
    result =
      company === EdgeOwner.JRH
        ? Fare.hokkaidoLocal(edgeDistances.sumOperationFareKm)
        : localFunction(edgeDistances.sumConvertedFareKm, edgeDistances.sumOperationFareKm)
  } else {
    result = crossFunction(edgeDistances.sumConvertedFareKm, edgeDistances.sumOperationFareKm)
  }
  return result
}
const calcCrossCompanyAdditionalFare = (routeDistance: EdgeDistanceArray): number => {
  let result = 0
  const additionalEdgeDistance: { [index in ChihoJR]: EdgeDistanceArray } = {
    [EdgeOwner.JRQ]: new EdgeDistanceArray(),
    [EdgeOwner.JRS]: new EdgeDistanceArray(),
    [EdgeOwner.JRH]: new EdgeDistanceArray()
  }
  // Art85(2)ha
  const edgeOwnerJRSADDX = routeDistance
    .map(ed => ed.companies)
    .filter(c => c.includes(EdgeOwner.JRSADDA) || c.includes(EdgeOwner.JRSADDB))
    .map(c => c.includes(EdgeOwner.JRSADDA))

  if (
    edgeOwnerJRSADDX.length === routeDistance.length &&
    edgeOwnerJRSADDX.filter((v, i, s) => s.indexOf(v) === i).length === 2
  ) {
    return 10
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
      result += santoCalc(targetEDs, chihoCompany) - hondoCalc(targetEDs)
    }
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
    resultFare = santoCalc(routeDistance, companies0)
  } else {
    // Cross company fare
    additionalFare += calcCrossCompanyAdditionalFare(routeDistance)
    resultFare = hondoCalc(routeDistance)
  }
  additionalFare += Fare.additionalFare(routeDistance.unionEdgeOwner())
  resultFare += additionalFare
  if (calcArg.stations[0].name === '児島' || calcArg.stations[calcArg.stations.length - 1].name === '児島') {
    if (routeDistance.unionEdgeOwner().includes(EdgeOwner.ADDSETO)) {
      if (routeDistance.sumOperationFareKm <= 20) {
        resultFare = 430
      } else if (routeDistance.sumOperationFareKm <= 25) {
        resultFare = 520
      }
    }
  }
  return { fare: resultFare, distanceResponse: resultDistanceResponse }
}
