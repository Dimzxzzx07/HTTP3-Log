"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UDPInput = void 0;
const dgram_1 = __importDefault(require("dgram"));
class UDPInput {
    constructor(port, callback) {
        this.port = port;
        this.callback = callback;
        this.server = dgram_1.default.createSocket("udp4");
    }
    start() {
        this.server.on("message", (msg) => {
            const log = msg.toString();
            this.callback(log);
        });
        this.server.bind(this.port);
    }
    stop() {
        this.server.close();
    }
}
exports.UDPInput = UDPInput;
