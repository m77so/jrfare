import * as fs from 'fs'
import * as path from 'path'
import { Companies, Line, MapZairai, OutputJSON, Station, FareTable } from './dataInterface'
const companyHash: { [key: string]: Companies } = {
  JR北: Companies.JRH,
  JR東: Companies.JRE,
  JR海: Companies.JRC,
  JR西: Companies.JRW,
  JR四: Companies.JRS,
  JR九: Companies.JRQ
}
const output: OutputJSON = {
  lineNames: [],
  stationNames: [],
  lines: [],
  stations: [],
  cities: [],
  appendixFare: {
    JRHkansen: {},
    JRQkansen: {},
    JRSkansen: {}
  }
}

const tsvLines = fs.readFileSync(path.join(__dirname, '..', 'resource', 'lines.tsv'), 'utf8').split('\n')
const tsvStations = fs.readFileSync(path.join(__dirname, '..', 'resource', 'stations.tsv'), 'utf8').split('\n')
const tsvDistances = fs.readFileSync(path.join(__dirname, '..', 'resource', 'distances.tsv'), 'utf8').split('\n')

// TSVファイルから駅情報，路線情報，キロ情報を読み込む
for (const station of tsvStations) {
  const [_id, name, kana] = station.split('\t')
  const id = +_id
  output.stations[id] = {
    id,
    name,
    kana,
    lineIds: [],
    company: [],
    city: -1
  }
  output.stationNames[id] = name
}

for (const line of tsvLines) {
  const [_id, name, kana] = line.split('\t')
  const id = +_id
  output.lines[id] = {
    id,
    name,
    kana,
    src: '',
    dest: '',
    stations: [],
    stationIds: [],
    kms: [],
    akms: [],
    dupLineStationIds: [],
    chiho: false,
    shinkansen: name.indexOf('新幹線') > -1,
    company: [],
    mapZairai: []
  }
  output.lineNames[id] = name
}

for (const distance of tsvDistances) {
  const [lineId, stationId, km, akm]: number[] = distance.split('\t').map(i => +i)
  const line = output.lines[lineId]
  line.stationIds.push(stationId)
  line.stations.push(output.stations[stationId].name)
  line.kms.push(km)
  line.akms.push(akm)
  const station = output.stations[stationId]
  station.lineIds.push(lineId)
}

// キロ数を元に路線内でソートする
for (const line of output.lines) {
  const index = [...Array(line.stations.length).keys()].sort((a, b) => line.kms[a] - line.kms[b])
  const kms = index.map(i => line.kms[i])
  const stations = index.map(i => line.stations[i]) || ['']
  const stationIds = index.map(i => line.stationIds[i]) || [-1]
  const akms = index.map(i => line.akms[i] || 0)
  line.kms = kms
  line.stations = stations
  line.stationIds = stationIds
  line.akms = akms
  line.src = stations[0]
  line.dest = stations[stations.length - 1]
  for (const stationId of stationIds) {
    const station = output.stations[stationId]
    if (station.lineIds.length > 1) {
      line.dupLineStationIds.push(stationId)
    }
  }
}

// 地方路線情報を付記
const chihoLines = fs.readFileSync(path.join(__dirname, '..', 'resource', 'chihoLines.txt'), 'utf-8').split('\n')
chihoLines.forEach(chihoLine => {
  output.lines.forEach(line => {
    if (line.name.includes(chihoLine)) {
      line.chiho = true
    }
  })
})

// 会社情報を付記
interface CompanyOwnData {
  entire: string[]
  partial: { [key: string]: string[] }
}
const companyJSONData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resource', 'company.json'), 'utf8'))
for (const companyName of Object.keys(companyJSONData)) {
  const companyCode = companyHash[companyName]
  const data = companyJSONData[companyName]
  const c: CompanyOwnData = Object.assign({}, data)

  output.lineNames.forEach((lineName, lineId) => {
    const line = output.lines[lineId]
    for (let i = 0; i < c.entire.length; ++i) {
      if (lineName.indexOf(c.entire[i]) !== 0) {
        continue
      }
      line.company.push(companyCode)
      line.stationIds.forEach(stationId => {
        const companyList = output.stations[stationId].company
        if (!companyList.includes(companyCode)) {
          companyList.push(companyCode)
        }
      })
      return
    }
    for (const partialLineName of Object.keys(c.partial)) {
      if (lineName.indexOf(partialLineName) !== 0) {
        continue
      }
      for (let i = 0; i < c.partial[partialLineName].length / 2; ++i) {
        let startIndex = line.stations.indexOf(c.partial[partialLineName][i * 2])
        let endIndex = line.stations.indexOf(c.partial[partialLineName][i * 2 + 1])
        ;[startIndex, endIndex] = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)]
        if (startIndex < 0 || endIndex < 0) {
          continue
        }
        for (let index = startIndex; index <= endIndex; ++index) {
          line.company[index] = companyCode
        }
        const stationIds = line.stationIds.slice(startIndex, endIndex + 1)
        stationIds.forEach(stationId => {
          const companyList = output.stations[stationId].company
          if (!companyList.includes(companyCode)) {
            companyList.push(companyCode)
          }
        })
      }
    }
    if (line.company.length < 1) {
      line.company.push(-1)
    }
  })
}
interface ShinzaiInterface {
  src: string
  dest: string
  line1: string
  line2: string
}
const dataShinzai = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resource', 'shinzai.json'), 'utf8'))
const shinzais: ShinzaiInterface[] = Object.assign([], dataShinzai)

for (const shinzai of shinzais) {
  const shin = output.lines[output.lineNames.indexOf(shinzai.line2)]
  const zai = output.lines[output.lineNames.indexOf(shinzai.line1)]
  ;[[shin, zai], [zai, shin]].forEach(lines => {
    const startIndex = lines[0].stations.indexOf(shinzai.src)
    const endIndex = lines[0].stations.indexOf(shinzai.dest)
    lines[0].mapZairai.push({
      startIndex: Math.min(startIndex, endIndex),
      endIndex: Math.max(startIndex, endIndex),
      targetLine: lines[1].id
    })
  })
}

const dataCity = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resource', 'city.json'), 'utf8'))
interface CityInterface {
  center: string // 代表駅
  origin: string // 市域を判定する時の中心駅
  border: string[] // 市域を判定するときの境界駅
  additional: string[] // 市域を判定する時のエリアに含まれない追加の駅
  reduce: string[] // 除去する駅
}
const cities: { [key: string]: CityInterface } = Object.assign({}, dataCity)
for (const cityAreaName of Object.keys(cities)) {
  const cityArea = cities[cityAreaName]
  const cityStationIds = [output.stationNames.indexOf(cityArea.origin)]
  const sourcedList: number[] = []
  let i = 0
  while (cityStationIds.length > sourcedList.length) {
    const srcStationId = cityStationIds[i++]
    const srcStation = output.stations[srcStationId]
    sourcedList.push(srcStationId)
    if (cityArea.border.includes(srcStation.name)) {
      continue
    }
    srcStation.lineIds.forEach(lineId => {
      if (output.lines[lineId].shinkansen) {
        return
      }
      const lineStationIds = output.lines[lineId].stationIds
      const lineIndex = lineStationIds.indexOf(srcStationId)
      ;[1, -1].forEach(diff => {
        const newLineIndex = diff + lineIndex
        if (
          sourcedList.includes(lineStationIds[newLineIndex]) ||
          newLineIndex < 0 ||
          lineStationIds.length <= newLineIndex
        ) {
          return
        }
        const additionalStation = output.stations[lineStationIds[newLineIndex]]
        if (cityStationIds.includes(additionalStation.id)) {
          return
        }
        cityStationIds.push(additionalStation.id)
      })
    })
  }
  cityArea.reduce.forEach(name => {
    cityStationIds.splice(cityStationIds.indexOf(output.stationNames.indexOf(name)), 1)
  })
  const cityId = output.cities.length
  output.cities.push({
    id: cityId,
    name: cityAreaName,
    centralStationId: output.stationNames.indexOf(cityArea.center),
    cityStationIds
  })
  cityStationIds.forEach(stationId => {
    output.stations[stationId].city = cityId
  })
}

const tsvJrhFare = fs.readFileSync(path.join(__dirname, '..', 'resource', 'jrhFare.tsv'), 'utf8').split('\n')
const tsvJrqFare = fs.readFileSync(path.join(__dirname, '..', 'resource', 'jrqFare.tsv'), 'utf8').split('\n')
const tsvJrsFare = fs.readFileSync(path.join(__dirname, '..', 'resource', 'jrsFare.tsv'), 'utf8').split('\n')

const procFareTable = (src: string[], target: FareTable) => {
  for (let l of src) {
    const t = l.split('\t')
    const lb = ~~t[0]
    const vl = ~~t[1]
    target[lb] = vl
  }
}

procFareTable(tsvJrhFare, output.appendixFare.JRHkansen)
procFareTable(tsvJrqFare, output.appendixFare.JRQkansen)
procFareTable(tsvJrsFare, output.appendixFare.JRSkansen)

fs.writeFileSync(path.join(__dirname, '..', 'output', 'data.json'), JSON.stringify(output, null, ''))
