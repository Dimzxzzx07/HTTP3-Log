export const traefikPatterns = {
  common: /^(?<date>[^ ]+) (?<time>[^ ]+) (?<level>\w+) (?<message>.+)$/,
  json: /^\{.*\}$/,
  access: /^(?<date>[^ ]+) (?<time>[^ ]+) (?<level>\w+) \{(?<clientIp>[^ ]+)\} - "(?<method>\S+) (?<url>\S+) (?<protocol>\S+)" (?<status>\d{3}) (?<size>\d+) "(?<referer>[^"]*)" "(?<userAgent>[^"]*)" (?<duration>\d+)$/
};