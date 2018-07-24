import { OutputJSON } from './dataInterface'

const fs = require('fs')
const iconv = require('iconv-lite')
const path = require('path')
if (process.argv.length - 2 !== 3) {
  console.warn('The number of arguments is less or much.\n\nnode marsToTSV.js mars_sd.dat mars_nn.dat outputDir')
  process.exit(100)
}
const marsSdDat = process.argv[2]
const marsNnDat = process.argv[3]
const outputDir = process.argv[4]
if (!fs.existsSync(marsSdDat)) {
  console.warn(`mars_sd.dat file "${marsSdDat}" does not exist.`)
  process.exit(100)
}
if (!fs.existsSync(marsNnDat)) {
  console.warn(`mars_nn.dat file "${marsNnDat}" does not exist.`)
  process.exit(100)
}
if (!(fs.existsSync(outputDir) && fs.statSync(outputDir).isDirectory())) {
  console.warn(`output directory ${outputDir} does not exist.`)
  process.exit(100)
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
    JRSkansen: { km: [], fare: [] }
  }
}
const dataSD = fs.readFileSync(marsSdDat)
/**
 * 半角カタカナを全角ひらがなに変換
 * https://qiita.com/hrdaya/items/291276a5a20971592216
 * @param {String} str 変換したい文字列
 */
const hankana2zenkana = function(str: string) {
  const kanaMap: { [key: string]: string } = {
    ｶﾞ: 'が',
    ｷﾞ: 'ぎ',
    ｸﾞ: 'ぐ',
    ｹﾞ: 'げ',
    ｺﾞ: 'ご',
    ｻﾞ: 'ざ',
    ｼﾞ: 'じ',
    ｽﾞ: 'ず',
    ｾﾞ: 'ぜ',
    ｿﾞ: 'ぞ',
    ﾀﾞ: 'だ',
    ﾁﾞ: 'ぢ',
    ﾂﾞ: 'づ',
    ﾃﾞ: 'で',
    ﾄﾞ: 'ど',
    ﾊﾞ: 'ば',
    ﾋﾞ: 'び',
    ﾌﾞ: 'ぶ',
    ﾍﾞ: 'べ',
    ﾎﾞ: 'ぼ',
    ﾊﾟ: 'ぱ',
    ﾋﾟ: 'ぴ',
    ﾌﾟ: 'ぷ',
    ﾍﾟ: 'ぺ',
    ﾎﾟ: 'ぽ',
    ｱ: 'あ',
    ｲ: 'い',
    ｳ: 'う',
    ｴ: 'え',
    ｵ: 'お',
    ｶ: 'か',
    ｷ: 'き',
    ｸ: 'く',
    ｹ: 'け',
    ｺ: 'こ',
    ｻ: 'さ',
    ｼ: 'し',
    ｽ: 'す',
    ｾ: 'せ',
    ｿ: 'そ',
    ﾀ: 'た',
    ﾁ: 'ち',
    ﾂ: 'つ',
    ﾃ: 'て',
    ﾄ: 'と',
    ﾅ: 'な',
    ﾆ: 'に',
    ﾇ: 'ぬ',
    ﾈ: 'ね',
    ﾉ: 'の',
    ﾊ: 'は',
    ﾋ: 'ひ',
    ﾌ: 'ふ',
    ﾍ: 'へ',
    ﾎ: 'ほ',
    ﾏ: 'ま',
    ﾐ: 'み',
    ﾑ: 'む',
    ﾒ: 'め',
    ﾓ: 'も',
    ﾔ: 'や',
    ﾕ: 'ゆ',
    ﾖ: 'よ',
    ﾗ: 'ら',
    ﾘ: 'り',
    ﾙ: 'る',
    ﾚ: 'れ',
    ﾛ: 'ろ',
    ﾜ: 'わ',
    ｦ: 'を',
    ﾝ: 'ん',
    ｧ: 'ぁ',
    ｨ: 'ぃ',
    ｩ: 'ぅ',
    ｪ: 'ぇ',
    ｫ: 'ぉ',
    ｯ: 'っ',
    ｬ: 'ゃ',
    ｭ: 'ゅ',
    ｮ: 'ょ',
    '｡': '。',
    '､': '、',
    ｰ: 'ー',
    '｢': '「',
    '｣': '」',
    '･': '・'
  }
  const reg = new RegExp('(' + Object.keys(kanaMap).join('|') + ')', 'g')
  return str
    .replace(reg, match => kanaMap[match])
    .replace(/ﾞ/g, '゛')
    .replace(/ﾟ/g, '゜')
}
const recordsNumSD = dataSD.length / 28
for (let r = 0; r < recordsNumSD; ++r) {
  const offset = 28 * r
  let cur = offset
  let record = []
  record.push(dataSD.readUInt8(cur++))
  record.push(dataSD.readInt16LE(cur++))
  cur++
  record.push(dataSD.readUInt8(cur++))
  record.push(iconv.decode(dataSD.slice(cur, cur + 14), 'cp932').replace(/ /g, ''))
  cur += 15
  record.push(iconv.decode(dataSD.slice(cur, cur + 9), 'cp932').replace(/ /g, ''))

  if (!output.lines[record[0]]) {
    output.lines[record[0]] = {
      id: record[0],
      name: record[3],
      kana: hankana2zenkana(record[4]),
      src: '',
      dest: '',
      stations: [],
      stationIds: [],
      kms: [],
      akms: [],
      dupLineStationIds: [],
      chiho: false,
      shinkansen: record[3].indexOf('新幹線') > -1,
      company: [],
      mapZairai: []
    }
    output.lineNames[record[0]] = record[3]
  } else if (record[0] > 0) {
    if (output.stationNames.includes(record[3])) {
      const id = output.stationNames.indexOf(record[3])
      output.stations[id].lineIds.push(record[0])
      const lineIds = output.stations[id].lineIds
      for (let lineId of lineIds) {
        if (!output.lines[lineId].dupLineStationIds.includes(id)) {
          output.lines[lineId].dupLineStationIds.push(id)
        }
      }
    } else {
      const nextId = output.stations.length
      output.stations.push({
        id: nextId,
        name: record[3],
        kana: hankana2zenkana(record[4]),
        lineIds: [record[0]],
        company: [],
        city: -1
      })
      output.stationNames.push(record[3])
    }
    const line = output.lines[record[0]]
    const stationId = output.stationNames.indexOf(record[3])
    line.stations.push(record[3])
    line.kms.push(record[1])
    line.stationIds.push(stationId)
  }
}

const dataNN = fs.readFileSync(marsNnDat)
const recordsNum = dataNN.length / 8

for (let r = 0; r < recordsNum; ++r) {
  const offset = 8 * r
  let cur = offset
  let record = []
  record.push(dataNN.readInt16LE(cur))
  cur += 2
  record.push(dataNN.readInt16LE(cur))
  cur += 2
  record.push(dataNN.readInt16LE(cur))
  cur += 2
  record.push(dataNN.readInt16LE(cur))
  const id = output.lines[record[0]].kms.indexOf(record[1])
  output.lines[record[0]].akms[id] = record[2]
}

for (let line of output.lines) {
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
}

fs.writeFileSync(
  path.join(outputDir, 'stations.tsv'),
  output.stations.map(s => [s.id, s.name, s.kana].join('\t')).join('\n')
)

fs.writeFileSync(path.join(outputDir, 'lines.tsv'), output.lines.map(s => [s.id, s.name, s.kana].join('\t')).join('\n'))

let distanceArr = []
for (let l of output.lines) {
  for (let i = 0; i < l.stationIds.length; ++i) {
    distanceArr.push([l.id, l.stationIds[i], l.kms[i], l.akms[i]].join('\t'))
  }
}
fs.writeFileSync(path.join(outputDir, 'distances.tsv'), distanceArr.join('\n'))
