import * as fs from 'fs'
import * as path from 'path'
import { EdgeOwner, Line, MapZairai, OutputJSON, Station, FareTable } from './dataInterface'
const ownerHash: { [key: string]: EdgeOwner } = {
  JR北: EdgeOwner.JRH,
  JR東: EdgeOwner.JRE,
  JR海: EdgeOwner.JRC,
  JR西: EdgeOwner.JRW,
  JR四: EdgeOwner.JRS,
  JR九: EdgeOwner.JRQ,
  東京特: EdgeOwner.TYOSPC,
  東京近: EdgeOwner.TYOSBB,
  山手: EdgeOwner.TYOJY,
  大阪特: EdgeOwner.OSASPC,
  大阪近: EdgeOwner.OSASBB,
  大阪環: EdgeOwner.OSALL,
  福岡近: EdgeOwner.FUKSBB,
  新潟近: EdgeOwner.KIJSBB,
  仙台近: EdgeOwner.SDJSBB
}
const output: OutputJSON = {
  lineNames: [],
  stationNames: [],
  lines: [],
  stations: [],
  cities: [],
  appendixFare: {
    JRHkansen: { km: [], fare: [] },
    JRQkansen: { km: [], fare: [] },
    JRSkansen: { km: [], fare: [] },
    local: { km: [], fare: [] },
    JRHlocal: { km: [], fare: [] },
    JRSJRQlocal: { operatingKm: [], convertedKm: [], JRQFare: [], JRSFare: [] }
  },
  localDistance: []
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
    local: false,
    shinkansen: name.indexOf('新幹線') > -1,
    edgeGroup: [],
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
const localLines = fs.readFileSync(path.join(__dirname, '..', 'resource', 'localLines.txt'), 'utf-8').split('\n')
localLines.forEach(localLine => {
  output.lines.forEach(line => {
    if (line.name.includes(localLine)) {
      line.local = true
    }
  })
})

// EdgeGroup初期化
for (let l of output.lines) {
  for (let i = 0; i < l.stations.length - 1; ++i) {
    l.edgeGroup.push([])
  }
}
// 会社情報を付記
const addCompanyToStation = (stationId: number, company: EdgeOwner) => {
  const c = output.stations[stationId].company
  if (c.indexOf(company) === -1) c.push(company)
}
// tsvファイルを行ごとに処理する
const tsvCompany = fs.readFileSync(path.join(__dirname, '..', 'resource', 'company.tsv'), 'utf8').split('\n')
for (let l of tsvCompany) {
  let lineName = ''
  let value = ''
  ;[lineName, value] = l.split('\t')
  const lines = output.lines.filter(l => l.name.includes(lineName))
  let valueArr = value.split(',')
  if (valueArr.length === 1) {
    // 全線が同一会社
    const company = ownerHash[value]
    for (let line of lines) {
      for (let lineEdgeGroupElem of line.edgeGroup) {
        if (lineEdgeGroupElem.indexOf(company) === -1) lineEdgeGroupElem.push(company)
      }
      for (let stationID of line.stationIds) {
        addCompanyToStation(stationID, company)
      }
    }
  } else {
    // 区間に依って会社が違う
    let stations = valueArr.filter((v, i) => i % 2 === 0)
    let companies = valueArr.filter((v, i) => i % 2 === 1)
    for (let line of lines) {
      const lineStations = line.stationIds.map(id => output.stations[id].name)
      let lineHasAllStations = true
      for (let station of stations) {
        lineHasAllStations = lineHasAllStations && lineStations.includes(station)
      }
      if (!lineHasAllStations) continue
      let stationLineIndices = stations.map(station => lineStations.indexOf(station))
      if (stationLineIndices[0] > stationLineIndices[stationLineIndices.length - 1]) {
        stations.reverse()
        stationLineIndices.reverse()
        companies.reverse()
      }
      let needle = 1
      for (let i = stationLineIndices[0]; i < stationLineIndices[stationLineIndices.length - 1]; ++i) {
        if (i >= stationLineIndices[needle]) {
          addCompanyToStation(line.stationIds[i], ownerHash[companies[needle - 1]])
          needle++
        }
        line.edgeGroup[i].push(ownerHash[companies[needle - 1]])
        addCompanyToStation(line.stationIds[i], ownerHash[companies[needle - 1]])
      }
      break
    }
  }
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
const tsvLocalFare = fs.readFileSync(path.join(__dirname, '..', 'resource', 'localFare.tsv'), 'utf8').split('\n')
const tsvJRHLocalFare = fs.readFileSync(path.join(__dirname, '..', 'resource', 'jrhLocalFare.tsv'), 'utf8').split('\n')

const procFareTable = (src: string[], target: FareTable) => {
  const tmpFaretable: { [key: number]: number } = {}
  for (let l of src) {
    const t = l.split('\t')
    const lb = ~~t[0]
    const vl = ~~t[1]
    tmpFaretable[lb] = vl
  }
  const ok = Object.keys(tmpFaretable)
    .map(l => ~~l)
    .sort((a, b) => a - b)
  for (let l of ok) {
    target.km.push(l)
    target.fare.push(tmpFaretable[l])
  }
}

procFareTable(tsvJrhFare, output.appendixFare.JRHkansen)
procFareTable(tsvJrqFare, output.appendixFare.JRQkansen)
procFareTable(tsvJrsFare, output.appendixFare.JRSkansen)
procFareTable(tsvLocalFare, output.appendixFare.local)
procFareTable(tsvJRHLocalFare, output.appendixFare.JRHlocal)

const tsvJRSJRQLocalFare = fs
  .readFileSync(path.join(__dirname, '..', 'resource', 'jrsjrqLocalFare.tsv'), 'utf8')
  .split('\n')
  .map(l => l.split('\t').map(v => ~~v))

for (let l of tsvJRSJRQLocalFare) {
  output.appendixFare.JRSJRQlocal.convertedKm.push(l[0])
  output.appendixFare.JRSJRQlocal.operatingKm.push(l[1])
  output.appendixFare.JRSJRQlocal.JRSFare.push(l[2])
  output.appendixFare.JRSJRQlocal.JRQFare.push(l[3])
}

const tsvLocalDistance = fs
  .readFileSync(path.join(__dirname, '..', 'resource', 'localDistance.tsv'), 'utf8')
  .split('\n')
  .map(l => l.split('\t').map(v => ~~v))
output.localDistance = tsvLocalDistance.map(l => l[0])
output.localDistance.push(tsvLocalDistance[tsvLocalDistance.length - 1][1])

fs.writeFileSync(path.join(__dirname, '..', 'output', 'data.json'), JSON.stringify(output, null, ''))
