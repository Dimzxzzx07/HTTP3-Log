"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.litespeedPatterns = void 0;
exports.litespeedPatterns = {
    combined: /^(?<ip>\S+) - (?<user>\S+) \[(?<time>[^\]]+)\] "(?<method>\S+) (?<url>\S+) (?<protocol>\S+)" (?<status>\d{3}) (?<size>\d+) "(?<referer>[^"]*)" "(?<userAgent>[^"]*)"$/,
    common: /^(?<ip>\S+) - (?<user>\S+) \[(?<time>[^\]]+)\] "(?<method>\S+) (?<url>\S+) (?<protocol>\S+)" (?<status>\d{3}) (?<size>\d+)$/
};
