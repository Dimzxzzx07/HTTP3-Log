export const litespeedPatterns = {
  combined: /^(?<ip>\S+) - (?<user>\S+) \[(?<time>[^\]]+)\] "(?<method>\S+) (?<url>\S+) (?<protocol>\S+)" (?<status>\d{3}) (?<size>\d+) "(?<referer>[^"]*)" "(?<userAgent>[^"]*)"$/,
  common: /^(?<ip>\S+) - (?<user>\S+) \[(?<time>[^\]]+)\] "(?<method>\S+) (?<url>\S+) (?<protocol>\S+)" (?<status>\d{3}) (?<size>\d+)$/
};