import { EventEmitter } from "events";
import { LogIngestor } from "./ingestor";
import { PatternMatcher } from "./matcher";
import { Enricher } from "./enricher";
import { StorageManager } from "./storage";
import { AnomalyDetector } from "../detectors/anomaly";
import { Config, LogEntry } from "../types";

export class H3LogParser extends EventEmitter {
  private ingestor: LogIngestor;
  private matcher: PatternMatcher;
  private enricher: Enricher;
  private storage: StorageManager;
  private anomalyDetector: AnomalyDetector;
  private config: Config;

  constructor(config: Config) {
    super();
    this.config = config;
    this.matcher = new PatternMatcher();
    this.enricher = new Enricher(config.enrichment);
    this.storage = new StorageManager(config.output);
    this.anomalyDetector = new AnomalyDetector(config.anomaly);
    this.ingestor = new LogIngestor(config.input, this.handleLog.bind(this));
  }

  private async handleLog(rawLog: string, provider: string): Promise<void> {
    const parsed = this.matcher.match(rawLog, provider);
    if (!parsed) {
      this.emit("error", new Error(`Failed to parse log from ${provider}`));
      return;
    }

    const enriched = await this.enricher.enrich(parsed);
    const logEntry: LogEntry = {
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

  public async start(): Promise<void> {
    await this.ingestor.start();
    await this.storage.connect();
    this.emit("started");
  }

  public async stop(): Promise<void> {
    await this.ingestor.stop();
    await this.storage.disconnect();
    this.emit("stopped");
  }

  public async parseFile(filePath: string, format: string): Promise<LogEntry[]> {
    const fs = require("fs");
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    const results: LogEntry[] = [];

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

  public on(event: "log", listener: (log: LogEntry) => void): this;
  public on(event: "anomaly", listener: (anomaly: any) => void): this;
  public on(event: "error", listener: (error: Error) => void): this;
  public on(event: "started", listener: () => void): this;
  public on(event: "stopped", listener: () => void): this;
  public on(event: string, listener: any): this {
    return super.on(event, listener);
  }
}