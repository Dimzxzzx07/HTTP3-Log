"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apachePatterns = void 0;
exports.apachePatterns = {
    common: /^(?<ip>\S+) (?<remoteUser>\S+) (?<authenticatedUser>\S+) \[(?<time>[^\]]+)\] "(?<method>\S+) (?<url>\S+) (?<protocol>\S+)" (?<status>\d{3}) (?<size>\d+)$/,
    combined: /^(?<ip>\S+) (?<remoteUser>\S+) (?<authenticatedUser>\S+) \[(?<time>[^\]]+)\] "(?<method>\S+) (?<url>\S+) (?<protocol>\S+)" (?<status>\d{3}) (?<size>\d+) "(?<referer>[^"]*)" "(?<userAgent>[^"]*)"$/,
    vhost: /^(?<ip>\S+) (?<remoteUser>\S+) (?<authenticatedUser>\S+) \[(?<time>[^\]]+)\] "(?<method>\S+) (?<url>\S+) (?<protocol>\S+)" (?<status>\d{3}) (?<size>\d+) "(?<referer>[^"]*)" "(?<userAgent>[^"]*)" (?<vhost>\S+)$/,
    error: /^\[(?<time>[^\]]+)\] \[(?<level>\w+)\] \[(?<client>\S+)?\] (?<message>.+)$/
};
