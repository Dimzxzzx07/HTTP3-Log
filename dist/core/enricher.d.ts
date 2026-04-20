import { EnrichedData, ParsedLog } from "../types";
export declare class Enricher {
    private geoipEnabled;
    private userAgentEnabled;
    private geoipReader;
    constructor(config: {
        geoip: boolean;
        userAgent: boolean;
    });
    private initGeoIP;
    enrich(parsed: ParsedLog): Promise<EnrichedData>;
}
