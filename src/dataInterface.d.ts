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
export interface OutputJSON {
  lineNames: string[]
  stationNames: string[]
  lines: Line[]
  cities: City[]
  stations: Station[]
}
export declare enum Companies {
  JRH = 0,
  JRE = 1,
  JRC = 2,
  JRW = 3,
  JRS = 4,
  JRQ = 5
}
