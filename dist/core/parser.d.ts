import { EventEmitter } from "events";
import { Config, LogEntry } from "../types";
export declare class H3LogParser extends EventEmitter {
    private ingestor;
    private matcher;
    private enricher;
    private storage;
    private anomalyDetector;
    private config;
    constructor(config: Config);
    private handleLog;
    start(): Promise<void>;
    stop(): Promise<void>;
    parseFile(filePath: string, format: string): Promise<LogEntry[]>;
    on(event: "log", listener: (log: LogEntry) => void): this;
    on(event: "anomaly", listener: (anomaly: any) => void): this;
    on(event: "error", listener: (error: Error) => void): this;
    on(event: "started", listener: () => void): this;
    on(event: "stopped", listener: () => void): this;
}
