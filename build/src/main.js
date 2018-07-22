"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var data_json_1 = __importDefault(require("./data.json"));
var ApplicationError = /** @class */ (function () {
    function ApplicationError(message) {
        this.message = message;
        this.name = 'ApplicationError';
    }
    ApplicationError.prototype.toString = function () {
        return this.name + ': ' + this.message;
    };
    return ApplicationError;
}());
exports.ApplicationError = ApplicationError;
function getStationsByName(stationName) {
    if (stationName === '')
        return data_json_1.default.stations;
    return data_json_1.default.stations.filter(function (s) { return s.name.includes(stationName); });
}
exports.getStationsByName = getStationsByName;
function getStationByName(stationName) {
    var stationId = data_json_1.default.stationNames.indexOf(stationName);
    if (stationId === -1) {
        var sugStations = getStationsByName(stationName);
        if (sugStations.length > 0) {
            stationId = sugStations[0].id;
        }
        else {
            throw new ApplicationError('Unknown Station');
        }
    }
    return data_json_1.default.stations[stationId];
}
exports.getStationByName = getStationByName;
function getStationsByLineAndName(lineName, stationName) {
    return data_json_1.default.lines
        .filter(function (l) { return l.name.includes(lineName); })
        .map(function (l) { return l.stationIds; })
        .flatten(1)
        .map(function (id) { return data_json_1.default.stations[id]; })
        .filter(function (s) { return s.name.includes(stationName); });
}
exports.getStationsByLineAndName = getStationsByLineAndName;
function getStationByLineAndName(lineName, stationName) {
    var stations = getStationsByLineAndName(lineName, stationName);
    if (stations.length > 0) {
        return stations[0];
    }
    else {
        throw new ApplicationError('Unknown Station');
    }
}
exports.getStationByLineAndName = getStationByLineAndName;
//# sourceMappingURL=main.js.map