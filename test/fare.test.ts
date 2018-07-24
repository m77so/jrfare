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

describe('Kyushu Kansen', () => {
  it('1..10km', () => {
    assert.equal(fare.kyushuKansen(1), 160)
    assert.equal(fare.kyushuKansen(5), 210)
    assert.equal(fare.kyushuKansen(6), 210)
    assert.equal(fare.kyushuKansen(9), 230)
  })
  it('On appendix table', () => {
    assert.equal(fare.kyushuKansen(12), 280)
    assert.equal(fare.kyushuKansen(21), 460)
    assert.equal(fare.kyushuKansen(49), 940)
    assert.equal(fare.kyushuKansen(999), 12740)
  })
  it('calculate', () => {
    assert.equal(fare.kyushuKansen(250), 4750)
    assert.equal(fare.kyushuKansen(512), 8640)
    assert.equal(fare.kyushuKansen(783), 11230)
    assert.equal(fare.kyushuKansen(182), 3670)
  })
})

describe('Hondo Local', () => {
  it('1..10km', () => {
    assert.equal(fare.hondoLocal(2), 140)
    assert.equal(fare.hondoLocal(5), 190)
    assert.equal(fare.hondoLocal(9), 210)
  })
  it('Around 22km', () => {
    assert.equal(fare.hondoLocal(20), 320)
    assert.equal(fare.hondoLocal(21), 410)
    assert.equal(fare.hondoLocal(22), 410)
    assert.equal(fare.hondoLocal(23), 410)
    assert.equal(fare.hondoLocal(24), 500)
  })
  it('Appendix table', () => {
    assert.equal(fare.hondoLocal(47), 970)
    assert.equal(fare.hondoLocal(108), 1940)
  })
  it('calculate', () => {
    assert.equal(fare.hondoLocal(99), 1850)
    assert.equal(fare.hondoLocal(140), 2590)
    assert.equal(fare.hondoLocal(300), 5620)
  })
})

describe('Hokkaido Local', () => {
  it('1..10km', () => {
    assert.equal(fare.hokkaidoLocal(2), 170)
    assert.equal(fare.hokkaidoLocal(5), 210)
    assert.equal(fare.hokkaidoLocal(9), 230)
  })
  it('Around 22km', () => {
    assert.equal(fare.hokkaidoLocal(20), 360)
    assert.equal(fare.hokkaidoLocal(21), 450)
    assert.equal(fare.hokkaidoLocal(22), 450)
    assert.equal(fare.hokkaidoLocal(23), 450)
    assert.equal(fare.hokkaidoLocal(24), 540)
  })
  it('Appendix table', () => {
    assert.equal(fare.hokkaidoLocal(47), 1070)
    assert.equal(fare.hokkaidoLocal(108), 2160)
  })
  it('calculate', () => {
    assert.equal(fare.hokkaidoLocal(150), 3240)
    assert.equal(fare.hokkaidoLocal(270), 5400)
    assert.equal(fare.hokkaidoLocal(663), 10800)
  })
})

describe('Shikoku Local', () => {
  it('Not Article 77-7 (2)', () => {
    assert.equal(fare.shikokuLocal(2, 2), 160)
    assert.equal(fare.shikokuLocal(4, 4), 210)
    assert.equal(fare.shikokuLocal(8, 7), 220)
    assert.equal(fare.shikokuLocal(15, 12), 260)
    assert.equal(fare.shikokuLocal(45, 33), 850)
    assert.equal(fare.shikokuLocal(51, 43), 1090)
    assert.equal(fare.shikokuLocal(145, 113), 2750)
  })
  it('Article 77-7 (2)', () => {
    assert.equal(fare.shikokuLocal(4, 3), 160)
    assert.equal(fare.shikokuLocal(11, 3), 230)
    assert.equal(fare.shikokuLocal(51, 46), 950)
  })
  it('JRQ exists but JRS not', () => {
    assert.equal(fare.shikokuLocal(91, 82), 1810)
    assert.equal(fare.shikokuLocal(181, 164), 3510)
  })
})

describe('Kyushu Local', () => {
  it('Not Article 77-7 (2)', () => {
    assert.equal(fare.kyushuLocal(2, 2), 160)
    assert.equal(fare.kyushuLocal(4, 4), 210)
    assert.equal(fare.kyushuLocal(8, 7), 230)
    assert.equal(fare.kyushuLocal(15, 12), 280)
    assert.equal(fare.kyushuLocal(45, 33), 840)
    assert.equal(fare.kyushuLocal(51, 43), 1110)
    assert.equal(fare.kyushuLocal(145, 113), 2810)
  })
  it('Article 77-7 (2)', () => {
    assert.equal(fare.kyushuLocal(4, 3), 180)
    assert.equal(fare.kyushuLocal(11, 3), 250)
    assert.equal(fare.kyushuLocal(51, 46), 1000)
  })
  it('JRQ exists but JRS not', () => {
    assert.equal(fare.kyushuLocal(91, 82), 1660)
    assert.equal(fare.kyushuLocal(181, 164), 3630)
  })
})
