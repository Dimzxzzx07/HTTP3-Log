"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.awsCloudfrontPatterns = void 0;
exports.awsCloudfrontPatterns = {
    standard: /^(?<date>[^ ]+) (?<time>[^ ]+) (?<xEdgeLocation>\S+) (?<scBytes>\d+) (?<cIp>\S+) (?<csMethod>\S+) (?<csHost>\S+) (?<csUriStem>\S+) (?<scStatus>\d+) (?<csReferer>[^ ]+) (?<csUserAgent>[^ ]+) (?<csUriQuery>[^ ]+) (?<cookies>[^ ]+) (?<xEdgeResultType>[^ ]+) (?<xEdgeRequestId>[^ ]+) (?<xHostHeader>[^ ]+) (?<csProtocol>[^ ]+) (?<csBytes>\d+) (?<timeTaken>\d+\.\d+) (?<xForwardedFor>[^ ]+) (?<sslProtocol>[^ ]+) (?<sslCipher>[^ ]+) (?<xEdgeResponseResultType>[^ ]+) (?<csProtocolVersion>[^ ]+) (?<fleStatus>[^ ]+) (?<fleEncryptedFields>[^ ]+) (?<cPort>\d+) (?<timeToFirstByte>\d+\.\d+) (?<xEdgeDetailedResultType>[^ ]+) (?<scContentType>[^ ]+) (?<scContentLen>\d+) (?<scRangeStart>\d+) (?<scRangeEnd>\d+)$/
};
