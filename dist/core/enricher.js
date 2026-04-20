"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enricher = void 0;
const ua_parser_js_1 = __importDefault(require("ua-parser-js"));
const maxmind = __importStar(require("maxmind"));
class Enricher {
    constructor(config) {
        this.geoipReader = null;
        this.geoipEnabled = config.geoip;
        this.userAgentEnabled = config.userAgent;
        if (this.geoipEnabled) {
            this.initGeoIP();
        }
    }
    async initGeoIP() {
        try {
            this.geoipReader = await maxmind.open("./GeoLite2-City.mmdb");
        }
        catch (error) {
            console.error("Failed to load GeoIP database:", error);
        }
    }
    async enrich(parsed) {
        const enriched = {};
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
            const parser = new ua_parser_js_1.default(parsed.userAgent);
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
exports.Enricher = Enricher;
