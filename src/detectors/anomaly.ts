import { LogEntry, AnomalyData } from "../types";
import cron from "node-cron";

interface AnomalyConfig {
  threshold: number;
  timeWindow: number;
  statusCodes: number[];
  alertWebhook: string;
}

interface StatusCounter {
  [statusCode: string]: number[];
}

export class AnomalyDetector {
  private config: AnomalyConfig;
  private counters: Map<string, StatusCounter> = new Map();
  private windowSize: number;

  constructor(config: AnomalyConfig) {
    this.config = config;
    this.windowSize = config.timeWindow * 1000;
    this.startCleanupJob();
  }

  private startCleanupJob(): void {
    cron.schedule("*/1 * * * *", () => {
      const now = Date.now();
      for (const [ip, counters] of this.counters) {
        for (const statusCode in counters) {
          counters[statusCode] = counters[statusCode].filter(
            (timestamp) => now - timestamp < this.windowSize
          );
        }
        const isEmpty = Object.values(counters).every((arr) => arr.length === 0);
        if (isEmpty) {
          this.counters.delete(ip);
        }
      }
    });
  }

  public check(log: LogEntry): AnomalyData | null {
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

    const ipCounters = this.counters.get(ip)!;
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

  public async alert(anomaly: AnomalyData): Promise<void> {
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
    } catch (error) {
      console.error("Failed to send alert:", error);
    }
  }
}