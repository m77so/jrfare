const chitaiCalc = (chitaiKms: number[], chitaiFares: number[], km: number): number => {
  let fareCent = 0
  console.log(chitaiFares, km)
  for (let i = 0; i < chitaiKms.length; ++i) {
    const subKm = Math.max(chitaiKms[i - 1] || 0, Math.min(chitaiKms[i], km)) - (chitaiKms[i - 1] || 0)
    if (subKm === 0) {
      break
    }
    fareCent += subKm * chitaiFares[i]
    console.log(subKm, chitaiFares[i], fareCent)
  }
  return fareCent
}

// Article 71 par.2
const kansenKmConvert = (km: number): number => {
  if (11 <= km && km <= 50) {
    km = ~~((km - 1) / 5) * 5 + 3
  } else if (km <= 100) {
    km = ~~((km - 1) / 10) * 10 + 5
  } else if (km <= 600) {
    km = ~~((km - 1) / 20) * 20 + 10
  } else if (km > 600) {
    km = ~~((km - 1) / 40) * 40 + 20
  } else {
    // throw
  }
  return km
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
// Article 84 (Less than or EQual to 10 km)
const leqTenKiloFare = (km: number, fare3km: number, fare6km: number, fare10km: number): number => {
  const fares = [fare3km, fare6km, fare10km]
  return fares[~~((km - 1) / 3)]
}

const kansenSuper = function(km: number, art84: number[], art77dist: number[], art77fare: number[]): number {
  let fareCent = 0
  if (km <= 10) {
    // Article 84 (1) i,ro,ha
    art84[3] = art84[2]
    return art84[~~((km - 1) / 3)]
  } else {
    // Article 77 par.2
    km = kansenKmConvert(km)
    // Article 77 (1)
    fareCent = chitaiCalc(art77dist, art77fare, km)
  }
  // Article 77 (2)
  return roundAndTax(km, fareCent)
}

// Article 77
export const hondoKansen = function(km: number): number {
  return kansenSuper(km, [140, 190, 200], [300, 600, 9999], [1620, 1285, 705])
}

// Article 77-2,84-2.
export const hokkaidoKansen = function(km: number): number {
  return kansenSuper(km, [170, 210, 220], [200, 300, 600, 9999], [1785, 1620, 1285, 705])
}

// Article 77-3,84-3.
export const shikokuKansen = function(km: number): number {
  return kansenSuper(km, [160, 210, 220], [100, 300, 600, 9999], [1821, 1620, 1285, 705])
}

export const kyushuKansen = function(km: number): number {
  let fareCent = 0
  if (km <= 10) {
    // Article 84 (1) i,ro,ha
    const art84 = [160, 210, 230, 230]
    return art84[~~((km - 1) / 3)]
  } else if (km <= 50) {
    // Article 77-4(1)
    const leq50 = [280, 370, 460, 560, 650, 740, 840, 940]
    return leq50[~~((km - 11) / 5)]
  } else if (km <= 100) {
    const leq100 = [1110, 1290, 1470, 1650, 1820]
    return leq100[~~((km - 51) / 10)]
  } else {
    km = kansenKmConvert(km)
    // Article 77-4 (2)
    fareCent = chitaiCalc([300, 600, 9999], [1775, 1285, 705], km)
  }
  // Article 77 (2)
  return roundAndTax(km, fareCent)
}
