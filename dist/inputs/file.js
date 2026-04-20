"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileInput = void 0;
const fs_1 = __importDefault(require("fs"));
const chokidar_1 = __importDefault(require("chokidar"));
class FileInput {
    constructor(path, callback) {
        this.path = path;
        this.callback = callback;
        this.lastPosition = 0;
    }
    start() {
        const stats = fs_1.default.statSync(this.path);
        this.lastPosition = stats.size;
        const content = fs_1.default.readFileSync(this.path, "utf8");
        const lines = content.split("\n");
        lines.forEach((line) => {
            if (line.trim()) {
                this.callback(line);
            }
        });
        this.watcher = chokidar_1.default.watch(this.path, {
            persistent: true,
            usePolling: true
        });
        this.watcher.on("change", () => {
            const newStats = fs_1.default.statSync(this.path);
            if (newStats.size > this.lastPosition) {
                const buffer = Buffer.alloc(newStats.size - this.lastPosition);
                const fd = fs_1.default.openSync(this.path, "r");
                fs_1.default.readSync(fd, buffer, 0, buffer.length, this.lastPosition);
                fs_1.default.closeSync(fd);
                const newContent = buffer.toString();
                const lines = newContent.split("\n");
                lines.forEach((line) => {
                    if (line.trim()) {
                        this.callback(line);
                    }
                });
                this.lastPosition = newStats.size;
            }
        });
    }
    stop() {
        if (this.watcher) {
            this.watcher.close();
        }
    }
}
exports.FileInput = FileInput;
