import * as main from '../src/main'
import { describe, it } from 'mocha'
import { assert, should } from 'chai'
import data from '../src/data.json'

describe('ApplicationError', () => {
  it('toString', () => {
    assert.equal(new main.ApplicationError('hoge').toString(), 'ApplicationError: hoge')
  })
})
describe('getStationsByName', () => {
  it('include multiple stations', () => {
    const res = main.getStationsByName('タウン')
    assert.equal(res.length, 2)
  })
  it('if unique, one station', () => {
    const res = main.getStationsByName('諏訪')
    assert.equal(res.length, 1)
  })
  it('include no stations', () => {
    const res = main.getStationsByName('れて')
    assert.equal(res.length, 0)
  })
  it('arg empty string', () => {
    const res = main.getStationsByName('')
    assert.equal(res.length, data.stations.length)
  })
})
describe('getStationByName', () => {
  it('direct', () => {
    const res = main.getStationByName('諏訪')
    assert.equal(res.kana, 'すわ')
  })
  it('substr', () => {
    const res = main.getStationByName('土岐')
    assert.equal(res.name, '土岐市')
  })
  it('invalid', () => {
    assert.throw(function() {
      main.getStationByName('らりるれ')
    }, 'らりるれ is Unknown Station')
  })
})

describe('getStationByLineAndName', () => {
  it('direct', () => {
    const res = main.getStationByLineAndName('東海', '住吉')
    assert.equal(res.kana, 'すみよし')
    assert.isOk(data.lines[res.lineIds[0]].name.includes('東海'))
  })
  it('error', () => {
    assert.throw(function() {
      main.getStationByLineAndName('中央', '住吉')
    }, 'Unknown Station')
  })
})

describe('getLineByName', () => {
  it('direct', () => {
    const res = main.getLineByName('中央東')
    assert.equal(res.name, '中央東')
  })
  it('substr', () => {
    const res = main.getLineByName('日田')
    assert.equal(res.name, '日田彦山')
  })
  it('invalid', () => {
    assert.throw(function() {
      main.getLineByName('中央')
    }, 'Unknown Line')
  })
})

describe('getLineByStationAndName', () => {
  it('direct', () => {
    const res = main.getLineByStationAndName('中央', '金山')
    assert.equal(res.name, '中央西')
  })
  it('invalid', () => {
    assert.throw(function() {
      main.getLineByStationAndName('山陰', '金山')
    }, 'Unknown Line')
  })
})
describe('getCalcArg', () => {
  it('direct', () => {
    const res = main.getCalcArg(['金沢', '米原', '金山', '塩尻', '辰野'], ['北陸', '東海道', '中央', '中央'])
    assert.equal(res.lines[2].name, '中央西')
  })
  it('invalid station', () => {
    assert.throw(function() {
      main.getCalcArg(['ハムスター', '米原', '金山', '塩尻', '辰野'], ['北陸', '東海道', '中央', '中央'])
    }, 'invalid station')
  })
  it('invalid line', () => {
    assert.throw(function() {
      main.getCalcArg(['甲府', '米原', '金山', '塩尻', '辰野'], ['北陸', '東海道', '中央', '中央'])
    }, 'invalid line')
  })
  it('曲芸', () => {
    const res = main.getCalcArg(['金', '米', '金山', '尻', '聖'], ['北', '海', '', ''])
    assert.equal(res.lines[2].name, '中央西')
  })
})
