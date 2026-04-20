"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnomalyDetector = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
class AnomalyDetector {
    constructor(config) {
        this.counters = new Map();
        this.config = config;
        this.windowSize = config.timeWindow * 1000;
        this.startCleanupJob();
    }
    startCleanupJob() {
        node_cron_1.default.schedule("*/1 * * * *", () => {
            const now = Date.now();
            for (const [ip, counters] of this.counters) {
                for (const statusCode in counters) {
                    counters[statusCode] = counters[statusCode].filter((timestamp) => now - timestamp < this.windowSize);
                }
                const isEmpty = Object.values(counters).every((arr) => arr.length === 0);
                if (isEmpty) {
                    this.counters.delete(ip);
                }
            }
        });
    }
    check(log) {
        const ip = log.parsed.ip;
        const status = log.parsed.status;
        if (!ip || !status) {
            return null;
        }
        if (!this.config.statusCodes.includes(status)) {
            return null;
        }
        if (!this.counters.has(ip)) {
            this.counters.set(ip, {});
        }
        const ipCounters = this.counters.get(ip);
        if (!ipCounters[status]) {
            ipCounters[status] = [];
        }
        ipCounters[status].push(Date.now());
        const recentCount = ipCounters[status].length;
        if (recentCount >= this.config.threshold) {
            return {
                isAnomaly: true,
                reason: `IP ${ip} generated ${recentCount} HTTP ${status} errors in ${this.config.timeWindow} seconds`,
                severity: "high"
            };
        }
        return null;
    }
    async alert(anomaly) {
        if (!this.config.alertWebhook) {
            return;
        }
        const payload = {
            title: "H3-Log Anomaly Detection Alert",
            message: anomaly.reason,
            severity: anomaly.severity,
            timestamp: new Date().toISOString()
        };
        try {
            const https = require("https");
            const url = new URL(this.config.alertWebhook);
            const data = JSON.stringify(payload);
            const options = {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(data)
                }
            };
            const req = https.request(options);
            req.write(data);
            req.end();
        }
        catch (error) {
            console.error("Failed to send alert:", error);
        }
    }
}
exports.AnomalyDetector = AnomalyDetector;
