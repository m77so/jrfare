export interface MapZairai {
  startIndex: number
  endIndex: number
  targetLine: number
}
export interface Line {
  id: number
  name: string
  kana: string
  src: string
  dest: string
  stations: string[]
  stationIds: number[]
  kms: number[]
  akms: number[]
  dupLineStationIds: number[]
  local: boolean
  shinkansen: boolean
  edgeGroup: number[][]
  mapZairai: MapZairai[]
}
export interface Station {
  id: number
  name: string
  kana: string
  lineIds: number[]
  company: number[]
  city: number
}
export interface City {
  id: number
  name: string
  centralStationId: number
  cityStationIds: number[]
}
export enum EdgeOwner {
  JRH,
  JRE,
  JRC,
  JRW,
  JRS,
  JRQ,
  TYOSPC, // 東京特定区間
  TYOSBB, // 東京近郊区間
  TYOJY, // 山手線
  OSASPC, // 大阪
  OSASBB,
  OSALL,
  FUKSBB,
  KIJSBB,
  SDJSBB
}
export interface FareTable {
  km: number[]
  fare: number[]
}
export interface JRSJRQlocalFareTable {
  convertedKm: number[]
  operatingKm: number[]
  JRSFare: number[]
  JRQFare: number[]
}
export interface AppendixFare {
  JRHkansen: FareTable
  JRSkansen: FareTable
  JRQkansen: FareTable
  local: FareTable
  JRHlocal: FareTable
  JRSJRQlocal: JRSJRQlocalFareTable
}

export interface OutputJSON {
  lineNames: string[]
  stationNames: string[]
  lines: Line[]
  cities: City[]
  stations: Station[]
  appendixFare: AppendixFare
  localDistance: number[]
}
