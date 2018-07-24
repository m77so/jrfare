import data from './data.json'
import * as dataInterface from './dataInterface'
const chitaiCalc = (chitaiKms: number[], chitaiFares: number[], km: number): number => {
  let fareCent = 0
  for (let i = 0; i < chitaiKms.length; ++i) {
    const subKm = Math.max(chitaiKms[i - 1] || 0, Math.min(chitaiKms[i], km)) - (chitaiKms[i - 1] || 0)
    if (subKm === 0) {
      break
    }
    fareCent += subKm * chitaiFares[i]
  }
  return fareCent
}

// Article 71 par.2
const kansenKmConvert = (km: number): number => {
  if (km < 11) {
    km = km
  } else if (km <= 50) {
    km = ~~((km - 1) / 5) * 5 + 3
  } else if (km <= 100) {
    km = ~~((km - 1) / 10) * 10 + 5
  } else if (km <= 600) {
    km = ~~((km - 1) / 20) * 20 + 10
  } else {
    km = ~~((km - 1) / 40) * 40 + 20
  }
  return km
}

const localKmConvert = (km: number): number => {
  if (km < 11 || km > 1200) return km
  const localDistanceIndex = data.localDistance.filter(i => i <= km).length
  return ~~((data.localDistance[localDistanceIndex] + data.localDistance[localDistanceIndex - 1] - 1) / 2)
}

// Article 71 (2)
const roundAndTax = (km: number, fareCent: number): number => {
  // Article 71 (1)
  if (km <= 100) {
    fareCent = Math.ceil(fareCent / 1000) * 1000
  } else {
    fareCent = Math.round(fareCent / 10000) * 10000
  }
  // Article 71 (2)
  fareCent *= 1.08
  fareCent = Math.round(fareCent / 1000) * 1000
  return fareCent / 100
}

const art77Super = function(
  km: number,
  faretable: dataInterface.FareTable | null,
  art84: number[],
  art77dist: number[],
  art77fare: number[]
): number {
  let fareCent = 0
  // Article 77-N par.2, Appendix 2-yi
  if (faretable !== null) {
    let faretableIndex = faretable.km.indexOf(km)
    if (faretableIndex > -1) return faretable.fare[faretableIndex]
  }

  if (km <= 10) {
    // Article 84 (1) yi,ro,ha
    art84[3] = art84[2]
    return art84[~~((km - 1) / 3)]
  } else {
    // Article 77 (1)
    fareCent = chitaiCalc(art77dist, art77fare, km)
  }
  // Article 77 (2)
  return roundAndTax(km, fareCent)
}

const kansenSuper = function(
  km: number,
  faretable: dataInterface.FareTable | null,
  art84: number[],
  art77dist: number[],
  art77fare: number[]
): number {
  // Article 77 par.2
  return art77Super(kansenKmConvert(km), faretable, art84, art77dist, art77fare)
}

// Article 77
export const hondoKansen = function(km: number): number {
  return kansenSuper(km, null, [140, 190, 200], [300, 600, 9999], [1620, 1285, 705])
}

// Article 77-2,84-2.
export const hokkaidoKansen = function(km: number): number {
  return kansenSuper(km, data.appendixFare.JRHkansen, [170, 210, 220], [200, 300, 600, 9999], [1785, 1620, 1285, 705])
}

// Article 77-3,84-3.
export const shikokuKansen = function(km: number): number {
  return kansenSuper(km, data.appendixFare.JRSkansen, [160, 210, 220], [100, 300, 600, 9999], [1821, 1620, 1285, 705])
}

// Article 77-4,84-4.
export const kyushuKansen = function(km: number): number {
  // Article 77-4 (1) is contained in the appendixFare.JRQkansen
  return kansenSuper(km, data.appendixFare.JRQkansen, [160, 210, 230], [300, 600, 9999], [1775, 1285, 705])
}

// Article 77-5, 84 (3)
export const hondoLocal = function(km: number): number {
  return art77Super(localKmConvert(km), data.appendixFare.local, [140, 190, 210], [273, 546, 9999], [1780, 1410, 770])
}

// Article 77-6, 84-2(2)
export const hokkaidoLocal = function(km: number): number {
  return art77Super(
    localKmConvert(km),
    data.appendixFare.JRHlocal,
    [170, 210, 230],
    [182, 273, 546, 9999],
    [1960, 1780, 1410, 770]
  )
}

// Article 77-7,8
const jrsjrqLocal = function(
  convertedKm: number,
  operationKm: number,
  fareArray: number[],
  kansenFunction: (km: number) => number
): number {
  const faretable = data.appendixFare.JRSJRQlocal
  const faretableIndex = faretable.convertedKm.indexOf(convertedKm)
  if (
    faretableIndex !== -1 &&
    (faretable.operatingKm[faretableIndex] === operationKm || faretable.operatingKm[faretableIndex] === -1) &&
    fareArray[faretableIndex] > 0
  ) {
    return fareArray[faretableIndex]
  }
  return kansenFunction(convertedKm)
}

// Article 77-7
export const shikokuLocal = function(convertedKm: number, operationKm: number): number {
  return jrsjrqLocal(convertedKm, operationKm, data.appendixFare.JRSJRQlocal.JRSFare, shikokuKansen)
}

// Article 77-8
export const kyushuLocal = function(convertedKm: number, operationKm: number): number {
  return jrsjrqLocal(convertedKm, operationKm, data.appendixFare.JRSJRQlocal.JRQFare, kyushuKansen)
}
