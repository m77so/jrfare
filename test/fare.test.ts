import * as fare from '../src/fare'
import { describe, it } from 'mocha'
import { assert } from 'chai'

describe('Hondo Kansen', () => {
  it('1..10km', () => {
    assert.equal(fare.hondoKansen(2), 140)
    assert.equal(fare.hondoKansen(4), 190)
    assert.equal(fare.hondoKansen(6), 190)
    assert.equal(fare.hondoKansen(10), 200)
  })
  it('11..km', () => {
    assert.equal(fare.hondoKansen(12), 240)
    assert.equal(fare.hondoKansen(21), 410)
    assert.equal(fare.hondoKansen(49), 840)
    assert.equal(fare.hondoKansen(77), 1320)
    assert.equal(fare.hondoKansen(182), 3350)
    assert.equal(fare.hondoKansen(333), 5620)
    assert.equal(fare.hondoKansen(3330), 30240)
  })
})

describe('Hokkaido Kansen', () => {
  it('1..10km', () => {
    assert.equal(fare.hokkaidoKansen(2), 170)
    assert.equal(fare.hokkaidoKansen(4), 210)
    assert.equal(fare.hokkaidoKansen(6), 210)
    assert.equal(fare.hokkaidoKansen(10), 220)
  })
  it('11..km', () => {
    assert.equal(fare.hokkaidoKansen(12), 260)
    assert.equal(fare.hokkaidoKansen(21), 450)
    assert.equal(fare.hokkaidoKansen(49), 930)
    assert.equal(fare.hokkaidoKansen(182), 3670)
    assert.equal(fare.hokkaidoKansen(234), 4320)
    assert.equal(fare.hokkaidoKansen(479), 7880)
    assert.equal(fare.hokkaidoKansen(1111), 13500)
  })
})

describe('Shikoku Kansen', () => {
  it('1..10km', () => {
    assert.equal(fare.shikokuKansen(2), 160)
    assert.equal(fare.shikokuKansen(4), 210)
    assert.equal(fare.shikokuKansen(6), 210)
    assert.equal(fare.shikokuKansen(10), 220)
  })
  it('11..km', () => {
    assert.equal(fare.shikokuKansen(12), 260)
    assert.equal(fare.shikokuKansen(21), 450)
    assert.equal(fare.shikokuKansen(49), 950)
    assert.equal(fare.shikokuKansen(182), 3510)
    assert.equal(fare.shikokuKansen(999), 12470)
  })
})
