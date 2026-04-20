export interface LogEntry {
    raw: string;
    parsed: ParsedLog;
    enriched: EnrichedData;
    provider: string;
    timestamp: Date;
}
export interface ParsedLog {
    ip?: string;
    method?: string;
    url?: string;
    status?: number;
    size?: number;
    referer?: string;
    userAgent?: string;
    responseTime?: number;
    [key: string]: any;
}
export interface EnrichedData {
    geoip?: GeoIPData;
    userAgentParsed?: UserAgentData;
    anomaly?: AnomalyData;
}
export interface GeoIPData {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
    asn: string;
}
export interface UserAgentData {
    browser: string;
    os: string;
    device: string;
}
export interface AnomalyData {
    isAnomaly: boolean;
    reason: string;
    severity: string;
}
export interface InputConfig {
    type: string;
    port?: number;
    path?: string;
    format: string;
}
export interface OutputConfig {
    type: string;
    host: string;
    port?: number;
    table?: string;
    index?: string;
}
export interface Config {
    input: InputConfig[];
    output: OutputConfig;
    enrichment: {
        geoip: boolean;
        userAgent: boolean;
        anomalyAlert: boolean;
    };
    anomaly: {
        threshold: number;
        timeWindow: number;
        statusCodes: number[];
        alertWebhook: string;
    };
}
