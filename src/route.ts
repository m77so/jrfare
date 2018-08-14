import {
  Line,
  Station,
  EdgeOwner,
  JRCompanies,
  JRChihoCompanies,
  JRHondoCompanies,
  ChihoJR,
  HondoJR,
  GroupJR,
  ShortRouteSection,
  ShortRouteSectionPair
} from './dataInterface'
import { ApplicationError } from './main'
import * as Fare from './fare'
import data from './data.json'
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
class EdgeDistance {
  companies: EdgeOwner[]
  operationDKm: number
  convertedDKm: number
  edgeLength: number
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
    this.edgeLength = 0
    this.kansen = false
    this.local = false
  }
  clone() {
    const clone = new EdgeDistance(this.companies)
    clone.operationDKm = this.operationDKm
    clone.operationDKm = this.operationDKm
    clone.convertedDKm = this.convertedDKm
    clone.edgeLength = this.edgeLength
    clone.kansen = this.kansen
    clone.local = this.local
    return clone
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
    this.edgeLength++
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
  clone() {
    return this.map(e => e.clone()) as EdgeDistanceArray
  }
  mergeSingleEdgeDistance() {
    const resultDistanceResponse = new EdgeDistance(this[0].companies)
    for (let rd of this) resultDistanceResponse.merge(rd)
    return resultDistanceResponse
  }
  applyArt69(): EdgeDistanceArray {
    let genEdgeOwnerShorts = () =>
      this.map(ed => {
        const s = ed.companies.filter(c => ShortRouteSection.concat(ShortRouteSectionPair).includes(c))
        return s.length === 1 ? s[0] : null
      })
    let edgeOwnerShorts = genEdgeOwnerShorts()
    if (edgeOwnerShorts.filter(c => c !== null).length === 0) return this

    for (let targetShortSection of ShortRouteSection) {
      const onlyTargetEdgeOwnerShorts = genEdgeOwnerShorts().map(
        c => (c === targetShortSection || c === targetShortSection + 1 ? c : null)
      )
      if (onlyTargetEdgeOwnerShorts.filter(c => c !== null).length === 0) continue
      for (let i = 0; i < onlyTargetEdgeOwnerShorts.length; ++i) {
        let cnt = 0
        let previ = i > 0 ? i - 1 : i
        let ii = i
        let arrCnt = 0
        while (i < onlyTargetEdgeOwnerShorts.length && onlyTargetEdgeOwnerShorts[i] === targetShortSection) {
          cnt += this[i++].edgeLength
          arrCnt++
        }
        if (ii !== i) --i
        let nexti = i + 1 < onlyTargetEdgeOwnerShorts.length ? i + 1 : i
        if (cnt !== data.edgeOwnersLength[targetShortSection]) continue
        if (
          onlyTargetEdgeOwnerShorts[previ] === targetShortSection + 1 ||
          onlyTargetEdgeOwnerShorts[nexti] === targetShortSection + 1
        ) {
          continue
        }
        const mapRoute = data.mapRoute.filter(mr => mr.id === targetShortSection)[0]
        const mapRouteStations = mapRoute.stationIds.map(id => data.stations[id])
        const mapRouteLines = mapRoute.lineIds.map(id => data.lines[id])
        const replaceEDA = getEdgeDistanceArray({ stations: mapRouteStations, lines: mapRouteLines }) // 不具合が起きたら向きを考える
        this.splice(ii, arrCnt, ...replaceEDA)
        break
      }
    }
    return this
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
const getEdgeDistanceArray = (calcArg: CalcArgument): EdgeDistanceArray => {
  const [stations, lines] = [calcArg.stations, calcArg.lines]
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
const applyArt85no3 = (resultFare: number, stations: Station[], routeDistance: EdgeDistanceArray): number => {
  if ([stations[0].name, stations[stations.length - 1].name].includes('児島')) {
    if (routeDistance.unionEdgeOwner().includes(EdgeOwner.ADDSETO)) {
      if (routeDistance.sumOperationFareKm <= 20) {
        resultFare = 430
      } else if (routeDistance.sumOperationFareKm <= 25) {
        resultFare = 520
      }
    }
  }
  return resultFare
}
export const calc = (routeDistance: EdgeDistanceArray, calcArg: CalcArgument): CalcResponse => {
  const companies = routeDistance.companies
  const hondoCompanies = companies.filter((c => (JRHondoCompanies as GroupJR[]).includes(c)) as ((
    c: GroupJR
  ) => c is HondoJR))
  const companies0 = companies[0]
  const resultDistanceResponse = routeDistance.mergeSingleEdgeDistance()
  resultDistanceResponse.companies = companies
  let [resultFare, additionalFare] = [0, 0]
  if (hondoCompanies.length > 0 && hondoCompanies.length === companies.length) {
    resultFare = hondoCalc(routeDistance)
  } else if (hondoCompanies.length === 0 && (JRChihoCompanies as GroupJR[]).includes(companies0)) {
    resultFare = santoCalc(routeDistance, companies0 as ChihoJR)
  } else {
    // Cross company fare
    additionalFare += calcCrossCompanyAdditionalFare(routeDistance)
    resultFare = hondoCalc(routeDistance)
  }
  additionalFare += Fare.additionalFare(routeDistance.unionEdgeOwner())
  resultFare += additionalFare
  // Art85-3
  resultFare = applyArt85no3(resultFare, calcArg.stations, routeDistance)
  return { fare: resultFare, distanceResponse: resultDistanceResponse }
}
interface RunResponse {
  fare: number
  route: DistanceResponse
  fareRoute: DistanceResponse
}
export const run = (calcArg: CalcArgument): RunResponse => {
  routeValidity(calcArg)
  const routeDistance = getEdgeDistanceArray(calcArg)
  const calcDistance = routeDistance.clone().applyArt69()
  const calcRes = calc(calcDistance, calcArg)
  return {
    fare: calcRes.fare,
    fareRoute: calcRes.distanceResponse,
    route: routeDistance.mergeSingleEdgeDistance()
  }
}
