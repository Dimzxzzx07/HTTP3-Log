import { LogEntry, OutputConfig } from "../types";
export declare class StorageManager {
    private config;
    private clickhouse;
    private elasticsearch;
    constructor(config: OutputConfig);
    connect(): Promise<void>;
    private initClickhouseTable;
    private initElasticsearchIndex;
    save(log: LogEntry): Promise<void>;
    disconnect(): Promise<void>;
}
