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
  SDJSBB,
  ADDKIXA,
  ADDKIXB,
  ADDSETO,
  ADDCTS,
  ADDKMI,
  JRSADDA, // Art85(2)ha
  JRSADDB // Art85(2)ha
}
export type ChihoJR = EdgeOwner.JRH | EdgeOwner.JRQ | EdgeOwner.JRS
export type HondoJR = EdgeOwner.JRC | EdgeOwner.JRE | EdgeOwner.JRW
export type GroupJR = ChihoJR | HondoJR
export const JRCompanies = [
  EdgeOwner.JRH,
  EdgeOwner.JRQ,
  EdgeOwner.JRS,
  EdgeOwner.JRC,
  EdgeOwner.JRE,
  EdgeOwner.JRW
] as GroupJR[]
export const JRHondoCompanies = [EdgeOwner.JRE, EdgeOwner.JRC, EdgeOwner.JRW] as HondoJR[]
export const JRChihoCompanies = [EdgeOwner.JRH, EdgeOwner.JRS, EdgeOwner.JRQ] as ChihoJR[]
export const AdditionalFareSection = [
  EdgeOwner.ADDCTS,
  EdgeOwner.ADDKIXA,
  EdgeOwner.ADDKIXB,
  EdgeOwner.ADDKMI,
  EdgeOwner.ADDSETO
]
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
