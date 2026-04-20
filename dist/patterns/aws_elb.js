"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.awsElbPatterns = void 0;
exports.awsElbPatterns = {
    classic: /^(?<timestamp>[^ ]+) (?<elbName>\S+) (?<clientIp>[\d\.]+):(?<clientPort>\d+) (?<backendIp>[\d\.]+):(?<backendPort>\d+) (?<requestProcessingTime>\d+\.\d+) (?<backendProcessingTime>\d+\.\d+) (?<responseProcessingTime>\d+\.\d+) (?<elbStatus>\d+) (?<backendStatus>\d+) (?<receivedBytes>\d+) (?<sentBytes>\d+) "(?<method>\S+) (?<url>\S+) (?<protocol>\S+)"$/,
    application: /^(?<timestamp>[^ ]+) (?<elbName>\S+) (?<clientIp>[\da-f\.:]+):(?<clientPort>\d+) (?<targetIp>[\da-f\.:]+):(?<targetPort>\d+) (?<requestProcessingTime>\d+\.\d+) (?<targetProcessingTime>\d+\.\d+) (?<responseProcessingTime>\d+\.\d+) (?<elbStatus>\d+) (?<targetStatus>\d+) (?<receivedBytes>\d+) (?<sentBytes>\d+) "(?<method>\S+) (?<url>\S+) (?<protocol>\S+)" "(?<userAgent>[^"]*)" (?<sslCipher>\S+) (?<sslProtocol>\S+) (?<targetGroupArn>\S+) "(?<traceId>[^"]*)"$/
};
