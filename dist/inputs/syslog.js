"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyslogInput = void 0;
const dgram_1 = __importDefault(require("dgram"));
class SyslogInput {
    constructor(port, callback) {
        this.port = port;
        this.callback = callback;
        this.server = dgram_1.default.createSocket("udp4");
    }
    start() {
        this.server.on("message", (msg) => {
            let rawMessage = msg.toString();
            const syslogRegex = /^<\d+>\d+ (?:[a-z]+ +\d+ \d+:\d+:\d+) (\S+) (.*)$/i;
            const match = rawMessage.match(syslogRegex);
            if (match) {
                const messageContent = match[2];
                this.callback(messageContent);
            }
            else {
                this.callback(rawMessage);
            }
        });
        this.server.bind(this.port);
    }
    stop() {
        this.server.close();
    }
}
exports.SyslogInput = SyslogInput;
