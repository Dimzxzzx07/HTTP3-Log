"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traefikPatterns = void 0;
exports.traefikPatterns = {
    common: /^(?<date>[^ ]+) (?<time>[^ ]+) (?<level>\w+) (?<message>.+)$/,
    json: /^\{.*\}$/,
    access: /^(?<date>[^ ]+) (?<time>[^ ]+) (?<level>\w+) \{(?<clientIp>[^ ]+)\} - "(?<method>\S+) (?<url>\S+) (?<protocol>\S+)" (?<status>\d{3}) (?<size>\d+) "(?<referer>[^"]*)" "(?<userAgent>[^"]*)" (?<duration>\d+)$/
};
