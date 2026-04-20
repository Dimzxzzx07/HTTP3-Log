import { LogEntry, AnomalyData } from "../types";
interface AnomalyConfig {
    threshold: number;
    timeWindow: number;
    statusCodes: number[];
    alertWebhook: string;
}
export declare class AnomalyDetector {
    private config;
    private counters;
    private windowSize;
    constructor(config: AnomalyConfig);
    private startCleanupJob;
    check(log: LogEntry): AnomalyData | null;
    alert(anomaly: AnomalyData): Promise<void>;
}
export {};
