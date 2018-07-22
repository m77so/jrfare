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
    const res = main.getStationsByName('諏訪')
    assert.equal(res.length, 3)
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
  it('multiple', () => {
    const res = main.getStationByName('大')
    assert.isOk(res.name.includes('大'))
  })
  it('invalid', () => {
    assert.throw(function() {
      main.getStationByName('らりるれ')
    }, 'Unknown Station')
  })
})

describe('getStationByLineAndName', () => {
  it('direct', () => {
    const res = main.getStationByLineAndName('東海', '住吉')
    assert.equal(res.kana, 'すみよし')
    assert.isOk(data.lines[res.lineIds[0]].name.includes('東海'))
  })
  it('direct', () => {
    assert.throw(function() {
      main.getStationByLineAndName('中央', '住吉')
    }, 'Unknown Station')
  })
})
