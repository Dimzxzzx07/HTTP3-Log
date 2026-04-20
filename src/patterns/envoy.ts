export const envoyPatterns = {
  json: /^\{.*\}$/,
  default: /^\[(?<timestamp>[^\]]+)\] \[(?<level>\w+)\] \[(?<source>[^\]]+)\] (?<message>.+)$/,
  access: /^\[(?<timestamp>[^\]]+)\] "(?<method>\S+) (?<url>\S+) (?<protocol>\S+)" (?<status>\d{3}) (?<responseFlags>\S+) (?<bytesReceived>\d+) (?<bytesSent>\d+) (?<duration>\d+) "(?<upstreamHost>[^"]*)" (?<upstreamCluster>\S+)$/
};