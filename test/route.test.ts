import * as Main from '../src/main'
import { describe, it } from 'mocha'
import { assert, should } from 'chai'
import data from '../src/data.json'
import * as Route from '../src/route'
describe('Route/Hondo', () => {
  it('Only Kansen', () => {
    const stations = ['原野', '春日井'].map(Main.getStationByName)
    const lines = ['中央西'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 1205)
    assert.equal(res.fare, 2270)
  })
  it('Only Local', () => {
    const stations = ['飛騨一ノ宮', '高山'].map(Main.getStationByName)
    const lines = ['高山'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 69)
    assert.equal(res.distanceResponse.local, true)
    assert.equal(res.fare, 210)
  })
  it('Local and Local', () => {
    const stations = ['余目', '新庄', '小牛田'].map(Main.getStationByName)
    const lines = ['陸羽西', '陸羽東'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 1371)
    assert.equal(res.distanceResponse.local, true)
    assert.equal(res.distanceResponse.kansen, false)
    assert.equal(res.fare, 2590)
  })
  it('Kansen and Local', () => {
    const stations = ['鶴岡', '余目', '新庄', '小牛田'].map(Main.getStationByName)
    const lines = ['羽越', '陸羽西', '陸羽東'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 1524)
    assert.equal(res.fare, 3020)
  })
  it('Kansen and Local <10km', () => {
    const stations = ['日岡', '加古川', '東加古川'].map(Main.getStationByName)
    const lines = ['加古川', '山陽'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 59)
    assert.equal(res.fare, 190)
  })
  it('Yamanote', () => {
    const stations = ['渋谷', '目黒'].map(Main.getStationByName)
    const lines = [Main.getLineByStationAndName('山手', '目黒')]
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 31)
    assert.equal(res.fare, 160)
  })
  it('OsakaLL', () => {
    const stations = ['天王寺', '今宮', '西九条'].map(Main.getStationByName)
    const lines = [Main.getLineByStationAndName('関西', '新今宮'), Main.getLineByName('大阪環状')]
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 74)
    assert.equal(res.fare, 180)
  })
  it('TokyoSS', () => {
    const stations = ['八王子', '西国分寺'].map(Main.getStationByName)
    const lines = [Main.getLineByStationAndName('中央', '八王子')]
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 146)
    assert.equal(res.fare, 220)
  })
  it('TokyoSS-notSS', () => {
    const stations = ['八王子', '岡谷'].map(Main.getStationByName)
    const lines = [Main.getLineByStationAndName('中央', '八王子')]
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 1630)
    assert.equal(res.fare, 3020)
  })
  it('OsakaSS', () => {
    const stations = ['京都', '尼崎'].map(Main.getStationByName)
    const lines = [Main.getLineByStationAndName('東海道', '京都')]
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 505)
    assert.equal(res.fare, 920)
  })
})

describe('Route/Kyushu', () => {
  it('Only Kansen', () => {
    const stations = ['日向市', '宮崎'].map(Main.getStationByName)
    const lines = ['日豊'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 632)
    assert.equal(res.fare, 1290)
  })
  it('Only Local', () => {
    const stations = ['大分', '久留米'].map(Main.getStationByName)
    const lines = ['久大'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 1415)
    assert.equal(res.fare, 2810)
  })
  it('Kansen and Local', () => {
    const stations = [
      Main.getStationByName('飯塚'),
      Main.getStationByLineAndName('筑豊', '桂川'),
      Main.getStationByName('門松')
    ]
    const lines = ['筑豊', '篠栗'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 233)
    assert.equal(res.fare, 460)
  })
})

describe('Route/Hokkaido', () => {
  it('Only Kansen', () => {
    const stations = ['長万部', '小樽'].map(Main.getStationByName)
    const lines = ['函館'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 1402)
    assert.equal(res.fare, 2810)
  })
  it('Local', () => {
    const stations = ['留萌', '深川'].map(Main.getStationByName)
    const lines = ['留萌'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 501)
    assert.equal(res.fare, 1070)
  })
})

describe('Route/Shikoku', () => {
  it('Only Kansen', () => {
    const stations = ['土佐山田', '琴平'].map(Main.getStationByName)
    const lines = ['土讃'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 1000)
    assert.equal(res.fare, 1810)
  })
  it('Local', () => {
    const stations = ['徳島', '文化の森'].map(Main.getStationByName)
    const lines = ['牟岐'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 39)
    assert.equal(res.fare, 210)
  })
})

describe('Route/Honshu-Kyushu', () => {
  it('Only Kansen', () => {
    const stations = ['小野田', '門司', '教育大前'].map(Main.getStationByName)
    const lines = [Main.getLineByStationAndName('山陽', '下関'), Main.getLineByStationAndName('鹿児島', '八幡')]
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 855)
    assert.equal(res.fare, 1590)
  })
})
describe('Route/Honshu-Shikoku', () => {
  it('Local and Kansen', () => {
    const stations = ['穴吹', '佃', '多度津', '宇多津', '茶屋町', '岡山'].map(Main.getStationByName)
    const lines = ['徳島', '土讃', '予讃', '本四備讃', '宇野'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 1218)
    assert.equal(res.fare, 2520)
  })
  it('Art85(2)ハ', () => {
    const stations = ['上の町', '宇多津'].map(Main.getStationByName)
    const lines = ['本四備讃'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 213)
    assert.equal(res.fare, 520)
  })
  it('Art85(2)ハ_2', () => {
    const stations = ['上の町', '宇多津', '丸亀'].map(Main.getStationByName)
    const lines = ['本四備讃', '予讃'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 239)
    assert.equal(res.fare, 520)
  })
  it('not Art85(2)ハ', () => {
    const stations = ['上の町', '宇多津', '讃岐塩屋'].map(Main.getStationByName)
    const lines = ['本四備讃', '予讃'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 255)
    assert.equal(res.fare, 640)
  })
  it('Art85-3(2)', () => {
    const stations = ['児島', '宇多津', '坂出'].map(Main.getStationByName)
    const lines = ['本四備讃', '予讃'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 227)
    assert.equal(res.fare, 520)
  })
  it('Art85-3(2)_2', () => {
    const stations = ['宇多津', '児島'].map(Main.getStationByName)
    const lines = ['本四備讃'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 181)
    assert.equal(res.fare, 430)
  })
  it('not Art85-3(2)', () => {
    const stations = ['児島', '宇多津', 'みの'].map(Main.getStationByName)
    const lines = ['本四備讃', '予讃'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 367)
    assert.equal(res.fare, 860)
  })
  it('not Art85-3(2)_2', () => {
    const stations = ['児島', '宇多津', '八十場'].map(Main.getStationByName)
    const lines = ['本四備讃', '予讃'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 254)
    assert.equal(res.fare, 650)
  })
})

describe('Route/AdditionalFare', () => {
  it('りんくうタウン~', () => {
    const stations = ['りんくうタウン', '日根野', '和歌山', '白浜'].map(Main.getStationByName)
    const lines = ['関西空港', '阪和', '紀勢'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 1361)
    assert.equal(res.fare, 2420)
  })
  it('関西空港~', () => {
    const stations = ['関西空港', '日根野', '和泉府中'].map(Main.getStationByName)
    const lines = ['関西空港', '阪和'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 251)
    assert.equal(res.fare, 720)
  })
  it('関西空港~りんくうタウン', () => {
    const stations = ['関西空港', 'りんくうタウン'].map(Main.getStationByName)
    const lines = ['関西空港'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 69)
    assert.equal(res.fare, 370)
  })
  it('新千歳空港', () => {
    const stations = ['新千歳空港', '南千歳', '北広島'].map(Main.getStationByName)
    const lines = [Main.getLineByStationAndName('千歳', '新千歳空港'), Main.getLineByStationAndName('千歳', '北広島')]
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 248)
    assert.equal(res.fare, 590)
  })
})

describe('Art69 短縮', () => {
  it('Kosei', () => {
    const stations = ['鯖江', '米原', '京都'].map(Main.getStationByName)
    const lines = ['北陸', '東海道'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.fare, 2270)
    // assert.equal(res.distanceResponse.operationDKm, 1539)
  })
  it('Kosei', () => {
    const stations = ['近江塩津', '米原', '山科'].map(Main.getStationByName)
    const lines = ['北陸', '東海道'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    // assert.equal(res.distanceResponse.operationDKm, 1000)
    assert.equal(res.fare, 1320)
  })
  it('Kosei', () => {
    const stations = ['福井', '米原', '山科', '大津京'].map(Main.getStationByName)
    const lines = ['北陸', '東海道', '湖西'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    // assert.equal(res.distanceResponse.operationDKm, 1000)
    assert.equal(res.fare, 3020)
  })
  it('Double', () => {
    const stations = ['福井', '米原', '神戸', '本由良']
    const lines = ['北陸', '東海道', '山陽']
    const res = Route.calc(Main.getCalcArg(stations, lines))
    // assert.equal(res.distanceResponse.operationDKm, 7029)
    assert.equal(res.fare, 9830)
  })
})
