"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var main = __importStar(require("../src/main"));
var mocha_1 = require("mocha");
var chai_1 = require("chai");
var data_json_1 = __importDefault(require("../src/data.json"));
mocha_1.describe('getStationsByName', function () {
    mocha_1.it('include multiple stations', function () {
        var res = main.getStationsByName('諏訪');
        chai_1.assert.equal(res.length, 3);
    });
    mocha_1.it('include no stations', function () {
        var res = main.getStationsByName('れて');
        chai_1.assert.equal(res.length, 0);
    });
    mocha_1.it('arg empty string', function () {
        var res = main.getStationsByName('');
        chai_1.assert.equal(res.length, data_json_1.default.stations.length);
    });
});
mocha_1.describe('getStationByName', function () {
    mocha_1.it('direct', function () {
        var res = main.getStationByName('諏訪');
        chai_1.assert.equal(res.kana, 'すわ');
    });
    mocha_1.it('multiple', function () {
        var res = main.getStationByName('大');
        chai_1.assert.isOk(res.name.includes('大'));
    });
    mocha_1.it('invalid', function () {
        chai_1.assert.throw(function () {
            main.getStationByName('らりるれ');
        }, 'Unknown Station');
    });
});
mocha_1.describe('getStationByLineAndName', function () {
    mocha_1.it('direct', function () {
        var res = main.getStationByLineAndName('東海', '住吉');
        chai_1.assert.equal(res.kana, 'すみよし');
        chai_1.assert.isOk(data_json_1.default.lines[res.lineIds[0]].name.includes('東海'));
    });
    mocha_1.it('direct', function () {
        chai_1.assert.throw(function () {
            main.getStationByLineAndName('中央', '住吉');
        }, 'Unknown Station');
    });
});
//# sourceMappingURL=main.test.js.map