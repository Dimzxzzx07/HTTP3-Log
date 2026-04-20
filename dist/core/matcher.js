"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternMatcher = void 0;
const nginx_1 = require("../patterns/nginx");
const caddy_1 = require("../patterns/caddy");
const apache_1 = require("../patterns/apache");
const haproxy_1 = require("../patterns/haproxy");
const traefik_1 = require("../patterns/traefik");
const envoy_1 = require("../patterns/envoy");
const cloudflare_1 = require("../patterns/cloudflare");
const aws_elb_1 = require("../patterns/aws_elb");
const aws_cloudfront_1 = require("../patterns/aws_cloudfront");
const iis_1 = require("../patterns/iis");
const litespeed_1 = require("../patterns/litespeed");
class PatternMatcher {
    constructor() {
        this.patterns = new Map();
        this.patterns.set("nginx", nginx_1.nginxPatterns);
        this.patterns.set("caddy", caddy_1.caddyPatterns);
        this.patterns.set("apache", apache_1.apachePatterns);
        this.patterns.set("haproxy", haproxy_1.haproxyPatterns);
        this.patterns.set("traefik", traefik_1.traefikPatterns);
        this.patterns.set("envoy", envoy_1.envoyPatterns);
        this.patterns.set("cloudflare", cloudflare_1.cloudflarePatterns);
        this.patterns.set("aws_elb", aws_elb_1.awsElbPatterns);
        this.patterns.set("aws_cloudfront", aws_cloudfront_1.awsCloudfrontPatterns);
        this.patterns.set("iis", iis_1.iisPatterns);
        this.patterns.set("litespeed", litespeed_1.litespeedPatterns);
    }
    match(rawLog, provider) {
        const providerPatterns = this.patterns.get(provider);
        if (!providerPatterns) {
            return this.tryAutoDetect(rawLog);
        }
        if (rawLog.trim().startsWith("{")) {
            return this.parseJson(rawLog);
        }
        const patternKeys = Object.keys(providerPatterns);
        for (const key of patternKeys) {
            const pattern = providerPatterns[key];
            if (pattern instanceof RegExp) {
                const match = rawLog.match(pattern);
                if (match && match.groups) {
                    return this.normalizeFields(match.groups);
                }
            }
        }
        return null;
    }
    tryAutoDetect(rawLog) {
        const providers = Array.from(this.patterns.keys());
        for (const provider of providers) {
            const patterns = this.patterns.get(provider);
            const patternKeys = Object.keys(patterns);
            for (const key of patternKeys) {
                const pattern = patterns[key];
                if (pattern instanceof RegExp) {
                    const match = rawLog.match(pattern);
                    if (match && match.groups) {
                        return this.normalizeFields(match.groups);
                    }
                }
            }
        }
        return null;
    }
    parseJson(rawLog) {
        try {
            const parsed = JSON.parse(rawLog);
            return this.normalizeFields(parsed);
        }
        catch {
            return null;
        }
    }
    normalizeFields(fields) {
        const normalized = {};
        if (fields.ip || fields.clientIp || fields.cIp || fields.remote_addr) {
            normalized.ip = fields.ip || fields.clientIp || fields.cIp || fields.remote_addr;
        }
        if (fields.method || fields.csMethod || fields.request_method) {
            normalized.method = fields.method || fields.csMethod || fields.request_method;
        }
        if (fields.url || fields.uri || fields.csUriStem || fields.request_uri) {
            normalized.url = fields.url || fields.uri || fields.csUriStem || fields.request_uri;
        }
        if (fields.status || fields.scStatus || fields.elbStatus || fields.response_status) {
            normalized.status = parseInt(fields.status || fields.scStatus || fields.elbStatus || fields.response_status);
        }
        if (fields.size || fields.bytes || fields.scBytes || fields.response_bytes) {
            normalized.size = parseInt(fields.size || fields.bytes || fields.scBytes || fields.response_bytes);
        }
        if (fields.referer || fields.csReferer || fields.http_referer) {
            normalized.referer = fields.referer || fields.csReferer || fields.http_referer;
        }
        if (fields.userAgent || fields.csUserAgent || fields.http_user_agent) {
            normalized.userAgent = fields.userAgent || fields.csUserAgent || fields.http_user_agent;
        }
        if (fields.duration || fields.timeTaken || fields.request_time || fields.response_time) {
            normalized.responseTime = parseFloat(fields.duration || fields.timeTaken || fields.request_time || fields.response_time);
        }
        Object.assign(normalized, fields);
        return normalized;
    }
}
exports.PatternMatcher = PatternMatcher;
