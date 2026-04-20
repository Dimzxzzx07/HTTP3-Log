"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iisPatterns = void 0;
exports.iisPatterns = {
    w3c: /^(?<date>[^ ]+) (?<time>[^ ]+) (?<sIp>\S+) (?<csMethod>\S+) (?<csUriStem>\S+) (?<csUriQuery>\S+) (?<sPort>\d+) (?<csUsername>\S+) (?<cIp>\S+) (?<csUserAgent>\S+) (?<scStatus>\d+) (?<scSubstatus>\d+) (?<scWin32Status>\d+) (?<timeTaken>\d+)$/,
    iisLog: /^(?<ip>\S+) (?<method>\S+) (?<url>\S+) (?<status>\d+) (?<size>\d+) (?<referer>\S+) (?<userAgent>\S+) (?<timeTaken>\d+)$/
};
