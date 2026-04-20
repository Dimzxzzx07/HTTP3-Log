"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.caddyPatterns = void 0;
exports.caddyPatterns = {
    json: /^\{.*\}$/,
    common: /^(?<ip>\S+)\s+(?<remoteUser>\S+)\s+(?<authenticatedUser>\S+)\s+\[(?<time>[^\]]+)\]\s+"(?<method>\S+)\s+(?<url>\S+)\s+(?<protocol>\S+)"\s+(?<status>\d{3})\s+(?<size>\d+)$/,
    combined: /^(?<ip>\S+)\s+(?<remoteUser>\S+)\s+(?<authenticatedUser>\S+)\s+\[(?<time>[^\]]+)\]\s+"(?<method>\S+)\s+(?<url>\S+)\s+(?<protocol>\S+)"\s+(?<status>\d{3})\s+(?<size>\d+)\s+"(?<referer>[^"]*)"\s+"(?<userAgent>[^"]*)"$/,
    caddyLog: /^{"level":"(?<level>\w+)","ts":"(?<timestamp>[^"]+)","logger":"(?<logger>[^"]+)","msg":"(?<message>[^"]+)","request":{"remote_ip":"(?<ip>[^"]+)","remote_port":"(?<port>\d+)","proto":"(?<protocol>[^"]+)","method":"(?<method>[^"]+)","host":"(?<host>[^"]+)","uri":"(?<uri>[^"]+)","headers":.*},"duration":(?<duration>\d+\.?\d*),"status":(?<status>\d+),"size":(?<size>\d+)}/
};
