import { EnrichedData, GeoIPData, UserAgentData, ParsedLog } from "../types";
import UAParser from "ua-parser-js";
import * as maxmind from "maxmind";

export class Enricher {
  private geoipEnabled: boolean;
  private userAgentEnabled: boolean;
  private geoipReader: any = null;

  constructor(config: { geoip: boolean; userAgent: boolean }) {
    this.geoipEnabled = config.geoip;
    this.userAgentEnabled = config.userAgent;

    if (this.geoipEnabled) {
      this.initGeoIP();
    }
  }

  private async initGeoIP(): Promise<void> {
    try {
      this.geoipReader = await maxmind.open("./GeoLite2-City.mmdb");
    } catch (error) {
      console.error("Failed to load GeoIP database:", error);
    }
  }

  public async enrich(parsed: ParsedLog): Promise<EnrichedData> {
    const enriched: EnrichedData = {};

    if (this.geoipEnabled && parsed.ip && this.geoipReader) {
      const geo = this.geoipReader.get(parsed.ip);
      if (geo) {
        enriched.geoip = {
          country: geo.country?.names?.en || "Unknown",
          city: geo.city?.names?.en || "Unknown",
          latitude: geo.location?.latitude || 0,
          longitude: geo.location?.longitude || 0,
          asn: geo.traits?.autonomous_system_number || "Unknown"
        };
      }
    }

    if (this.userAgentEnabled && parsed.userAgent) {
      const parser = new UAParser(parsed.userAgent);
      const result = parser.getResult();
      enriched.userAgentParsed = {
        browser: `${result.browser.name || "Unknown"} ${result.browser.version || ""}`.trim(),
        os: `${result.os.name || "Unknown"} ${result.os.version || ""}`.trim(),
        device: result.device.type || "desktop"
      };
    }

    return enriched;
  }
}