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
  chiho: boolean
  shinkansen: boolean
  company: number[]
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
export enum Companies {
  JRH,
  JRE,
  JRC,
  JRW,
  JRS,
  JRQ
}
export interface FareTable {
  km: number[]
  fare: number[]
}
export interface AppendixFare {
  JRHkansen: FareTable
  JRSkansen: FareTable
  JRQkansen: FareTable
}

export interface OutputJSON {
  lineNames: string[]
  stationNames: string[]
  lines: Line[]
  cities: City[]
  stations: Station[]
  appendixFare: AppendixFare
}
