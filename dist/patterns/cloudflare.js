"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudflarePatterns = void 0;
exports.cloudflarePatterns = {
    json: /^\{.*\}$/,
    edge: /^(?<ip>\S+) - (?<user>\S+) \[(?<time>[^\]]+)\] "(?<method>\S+) (?<url>\S+) (?<protocol>\S+)" (?<status>\d{3}) (?<size>\d+) "(?<referer>[^"]*)" "(?<userAgent>[^"]*)" (?<rayId>\S+) (?<cfRay>\S+) (?<cfCacheStatus>\S+)$/,
    ray: /^(?<rayId>\S+) (?<timestamp>\d+) (?<requestHost>\S+) (?<requestUri>\S+) (?<requestMethod>\S+) (?<responseStatus>\d+) (?<responseBytes>\d+) (?<clientIp>\S+) (?<clientRequestUserAgent>\S+) (?<clientRequestReferer>\S+) (?<edgeResponseStatus>\d+) (?<edgeResponseBytes>\d+) (?<edgeStartTimestamp>\d+) (?<edgeEndTimestamp>\d+) (?<cacheStatus>\S+) (?<originResponseStatus>\d+) (?<originResponseBytes>\d+) (?<originResponseTime>\d+)$/
};
