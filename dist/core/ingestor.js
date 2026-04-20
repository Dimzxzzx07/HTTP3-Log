"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogIngestor = void 0;
const dgram_1 = __importDefault(require("dgram"));
const net_1 = __importDefault(require("net"));
const fs_1 = __importDefault(require("fs"));
const chokidar_1 = __importDefault(require("chokidar"));
class LogIngestor {
    constructor(inputs, callback) {
        this.handlers = new Map();
        this.inputs = inputs;
        this.logCallback = callback;
    }
    async start() {
        for (const input of this.inputs) {
            await this.setupInput(input);
        }
    }
    async setupInput(input) {
        switch (input.type) {
            case "udp":
                this.setupUDP(input);
                break;
            case "tcp":
                this.setupTCP(input);
                break;
            case "file":
                this.setupFile(input);
                break;
            case "syslog":
                this.setupSyslog(input);
                break;
            default:
                throw new Error(`Unknown input type: ${input.type}`);
        }
    }
    setupUDP(input) {
        const server = dgram_1.default.createSocket("udp4");
        server.on("message", (msg) => {
            const log = msg.toString();
            this.logCallback(log, input.format);
        });
        if (input.port) {
            server.bind(input.port);
            this.handlers.set(`udp:${input.port}`, server);
        }
    }
    setupTCP(input) {
        const server = net_1.default.createServer((socket) => {
            socket.on("data", (data) => {
                const logs = data.toString().split("\n");
                logs.forEach((log) => {
                    if (log.trim()) {
                        this.logCallback(log, input.format);
                    }
                });
            });
        });
        if (input.port) {
            server.listen(input.port);
            this.handlers.set(`tcp:${input.port}`, server);
        }
    }
    setupFile(input) {
        if (!input.path) {
            return;
        }
        const watcher = chokidar_1.default.watch(input.path, {
            persistent: true,
            usePolling: true
        });
        watcher.on("change", (path) => {
            const content = fs_1.default.readFileSync(path, "utf8");
            const lines = content.split("\n");
            const lastLine = lines[lines.length - 2];
            if (lastLine) {
                this.logCallback(lastLine, input.format);
            }
        });
        const initialContent = fs_1.default.readFileSync(input.path, "utf8");
        const lines = initialContent.split("\n");
        lines.forEach((line) => {
            if (line.trim()) {
                this.logCallback(line, input.format);
            }
        });
        this.handlers.set(`file:${input.path}`, watcher);
    }
    setupSyslog(input) {
        const server = dgram_1.default.createSocket("udp4");
        server.on("message", (msg) => {
            let log = msg.toString();
            const syslogRegex = /^<\d+>\d+ (?:[a-z]+ +\d+ \d+:\d+:\d+) (\S+) (.+)$/i;
            const match = log.match(syslogRegex);
            if (match) {
                log = match[2];
            }
            this.logCallback(log, input.format);
        });
        if (input.port) {
            server.bind(input.port);
            this.handlers.set(`syslog:${input.port}`, server);
        }
    }
    async stop() {
        for (const [key, handler] of this.handlers) {
            if (handler.close) {
                handler.close();
            }
            else if (handler.unwatch) {
                await handler.close();
            }
        }
        this.handlers.clear();
    }
}
exports.LogIngestor = LogIngestor;
