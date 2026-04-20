"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nginxPatterns = void 0;
exports.nginxPatterns = {
    combined: /^(?<ip>\S+) - (?<user>\S+) \[(?<time>[^\]]+)\] "(?<method>\S+)\s+(?<url>\S+)\s+(?<protocol>\S+)" (?<status>\d{3}) (?<size>\d+) "(?<referer>[^"]*)" "(?<userAgent>[^"]*)"$/,
    json: /^\{.*\}$/,
    error: /^(?<time>[^ ]+)\s+\[(?<level>\w+)\]\s+(?<pid>\d+)#(?<tid>\d+):\s+\*(?<connection>\d+)\s+(?<message>.+)$/,
    stream: /^(?<ip>\S+)\s+(?<remoteUser>\S+)\s+\[(?<time>[^\]]+)\]\s+"(?<method>\S+)\s+(?<url>\S+)\s+(?<protocol>\S+)"\s+(?<status>\d{3})\s+(?<size>\d+)\s+"(?<referer>[^"]*)"\s+"(?<userAgent>[^"]*)"\s+(?<requestTime>\d+\.\d+)$/
};
