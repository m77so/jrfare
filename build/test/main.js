"use strict";
describe('路線指定', function () {
    const stations = ['新宿', '塩尻', '松本'].map(jrfare.getStationByName);
    const lines = ['中央東', '篠ノ井'].map(jrfare.getLineByName);
    const res = jrfare.calc({ node: stations, edge: lines });
    expect(res.fare).to.equal(4000);
});
describe('最短経路を雑に指定', function () {
    const stations = ['新宿', '小山', '水戸'].map(jrfare.getStationByName);
    const res = jrfare.calc({ node: stations, edgeType: jrfare.SHORTEST });
    expect(res.fare).to.equal(2268);
});
describe('重複のある駅名を一意に指定', function () {
    const stations = ['新宿'].map(jrfare.getStationByName);
    stations.push(jrfare.getStationByLineAndName('東海道', '金山'));
    const res = jrfare.calc({ node: stations, edgeType: jrfare.SHORTEST });
    expect(res.fare).to.equal(6260);
});
