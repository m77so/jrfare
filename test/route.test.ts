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
    assert.equal(res.fare, 2590)
  })
  it('Kansen and Local', () => {
    const stations = ['鶴岡', '余目', '新庄', '小牛田'].map(Main.getStationByName)
    const lines = ['羽越', '陸羽西', '陸羽東'].map(Main.getLineByName)
    const res = Route.calc({ stations: stations, lines: lines })
    assert.equal(res.distanceResponse.operationDKm, 1524)
    assert.equal(res.fare, 3020)
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
