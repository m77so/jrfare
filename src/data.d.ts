import * as dataInterface from './dataInterface'
declare module '*.json' {
  interface MapZairai {
    startIndex: number
    endIndex: number
    targetLine: number
  }
  interface Line {
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
  interface Station {
    id: number
    name: string
    kana: string
    lineIds: number[]
    company: number[]
    city: number
  }
  interface City {
    id: number
    name: string
    centralStationId: number
    cityStationIds: number[]
  }
  interface OutputJSON {
    lineNames: string[]
    stationNames: string[]
    lines: Line[]
    cities: City[]
    stations: Station[]
  }
  enum Companies {
    JRH,
    JRE,
    JRC,
    JRW,
    JRS,
    JRQ
  }
  const value: OutputJSON
  export = value
}
