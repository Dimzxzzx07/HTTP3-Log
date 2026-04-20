"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.H3LogParser = void 0;
const events_1 = require("events");
const ingestor_1 = require("./ingestor");
const matcher_1 = require("./matcher");
const enricher_1 = require("./enricher");
const storage_1 = require("./storage");
const anomaly_1 = require("../detectors/anomaly");
class H3LogParser extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.matcher = new matcher_1.PatternMatcher();
        this.enricher = new enricher_1.Enricher(config.enrichment);
        this.storage = new storage_1.StorageManager(config.output);
        this.anomalyDetector = new anomaly_1.AnomalyDetector(config.anomaly);
        this.ingestor = new ingestor_1.LogIngestor(config.input, this.handleLog.bind(this));
    }
    async handleLog(rawLog, provider) {
        const parsed = this.matcher.match(rawLog, provider);
        if (!parsed) {
            this.emit("error", new Error(`Failed to parse log from ${provider}`));
            return;
        }
        const enriched = await this.enricher.enrich(parsed);
        const logEntry = {
            raw: rawLog,
            parsed: parsed,
            enriched: enriched,
            provider: provider,
            timestamp: new Date()
        };
        const anomaly = this.anomalyDetector.check(logEntry);
        if (anomaly) {
            this.emit("anomaly", anomaly);
            await this.anomalyDetector.alert(anomaly);
        }
        await this.storage.save(logEntry);
        this.emit("log", logEntry);
    }
    async start() {
        await this.ingestor.start();
        await this.storage.connect();
        this.emit("started");
    }
    async stop() {
        await this.ingestor.stop();
        await this.storage.disconnect();
        this.emit("stopped");
    }
    async parseFile(filePath, format) {
        const fs = require("fs");
        const content = fs.readFileSync(filePath, "utf8");
        const lines = content.split("\n");
        const results = [];
        for (const line of lines) {
            if (line.trim()) {
                const parsed = this.matcher.match(line, format);
                if (parsed) {
                    const enriched = await this.enricher.enrich(parsed);
                    results.push({
                        raw: line,
                        parsed: parsed,
                        enriched: enriched,
                        provider: format,
                        timestamp: new Date()
                    });
                }
            }
        }
        return results;
    }
    on(event, listener) {
        return super.on(event, listener);
    }
}
exports.H3LogParser = H3LogParser;
