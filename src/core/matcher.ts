import { nginxPatterns } from "../patterns/nginx";
import { caddyPatterns } from "../patterns/caddy";
import { apachePatterns } from "../patterns/apache";
import { haproxyPatterns } from "../patterns/haproxy";
import { traefikPatterns } from "../patterns/traefik";
import { envoyPatterns } from "../patterns/envoy";
import { cloudflarePatterns } from "../patterns/cloudflare";
import { awsElbPatterns } from "../patterns/aws_elb";
import { awsCloudfrontPatterns } from "../patterns/aws_cloudfront";
import { iisPatterns } from "../patterns/iis";
import { litespeedPatterns } from "../patterns/litespeed";

export class PatternMatcher {
  private patterns: Map<string, any> = new Map();

  constructor() {
    this.patterns.set("nginx", nginxPatterns);
    this.patterns.set("caddy", caddyPatterns);
    this.patterns.set("apache", apachePatterns);
    this.patterns.set("haproxy", haproxyPatterns);
    this.patterns.set("traefik", traefikPatterns);
    this.patterns.set("envoy", envoyPatterns);
    this.patterns.set("cloudflare", cloudflarePatterns);
    this.patterns.set("aws_elb", awsElbPatterns);
    this.patterns.set("aws_cloudfront", awsCloudfrontPatterns);
    this.patterns.set("iis", iisPatterns);
    this.patterns.set("litespeed", litespeedPatterns);
  }

  public match(rawLog: string, provider: string): any {
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

  private tryAutoDetect(rawLog: string): any {
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

  private parseJson(rawLog: string): any {
    try {
      const parsed = JSON.parse(rawLog);
      return this.normalizeFields(parsed);
    } catch {
      return null;
    }
  }

  private normalizeFields(fields: any): any {
    const normalized: any = {};

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