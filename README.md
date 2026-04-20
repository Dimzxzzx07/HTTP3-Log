# http3-log

<div align="center">
    <img src="https://img.shields.io/badge/Version-1.0.0-2563eb?style=for-the-badge&logo=typescript" alt="Version">
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge&logo=open-source-initiative" alt="License">
    <img src="https://img.shields.io/badge/Node-18%2B-339933?style=for-the-badge&logo=nodedotjs" alt="Node">
    <img src="https://img.shields.io/badge/ClickHouse-FFCC01?style=for-the-badge&logo=clickhouse" alt="ClickHouse">
    <img src="https://img.shields.io/badge/Elasticsearch-005571?style=for-the-badge&logo=elasticsearch" alt="Elasticsearch">
</div>

<div align="center">
    <a href="https://t.me/Dimzxzzx07">
        <img src="https://img.shields.io/badge/Telegram-Dimzxzzx07-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram">
    </a>
    <a href="https://github.com/Dimzxzzx07">
        <img src="https://img.shields.io/badge/GitHub-Dimzxzzx07-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
    </a>
    <a href="https://www.npmjs.com/package/http3-log">
        <img src="https://img.shields.io/badge/NPM-http3--log-CB3837?style=for-the-badge&logo=npm" alt="NPM">
    </a>
</div>

---

## Table of Contents

- [What is HTTP3-Log?](#what-is-http3-log)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [CLI Usage](#cli-usage)
- [Configuration Guide](#configuration-guide)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [FAQ](#faq)
- [Terms of Service](#terms-of-service)
- [License](#license)

---

## What is HTTP3-Log?

**HTTP3-Log** is a high-performance log parser and aggregator for web servers supporting HTTP/3, HTTP/2, and traditional HTTP/1.1. It ingests logs from multiple sources (UDP, TCP, Syslog, File watcher), automatically detects log formats using regex patterns for 11+ web servers (Nginx, Caddy, Apache, HAProxy, Traefik, Envoy, Cloudflare, AWS ELB, AWS CloudFront, IIS, LiteSpeed), enriches data with GeoIP and User-Agent parsing, stores in ClickHouse or Elasticsearch, and provides real-time anomaly detection with alerting.

---

## Features

| Category | Features |
|----------|----------|
| Input Sources | UDP, TCP, Syslog, File watcher, Batch file parsing |
| Log Formats | Nginx, Caddy, Apache, HAProxy, Traefik, Envoy, Cloudflare, AWS ELB, AWS CloudFront, IIS, LiteSpeed |
| Enrichment | GeoIP (country, city, coordinates, ASN), User-Agent parsing (browser, OS, device) |
| Storage | ClickHouse, Elasticsearch |
| Detection | Anomaly detection with configurable thresholds, status code monitoring, webhook alerts |
| CLI Support | Daemon mode, Batch mode, Live tail, Real-time statistics dashboard |
| Output | JSON export, CSV export, Real-time terminal dashboard |
| Pattern Matching | Auto-detection, Regex patterns, JSON parsing |
| Performance | Async processing, Stream-based ingestion, Non-blocking I/O |

---

## Installation

From NPM

```bash
npm install http3-log
npm install -g http3-log
```

Requirements

Requirement Minimum Recommended
Node.js 18.0.0 20.0.0+
RAM 256 MB 1 GB+
Storage 50 MB 100 MB
OS Linux 5.4+ Ubuntu 22.04+

For ClickHouse Storage

```bash
# Ubuntu/Debian
sudo apt-get install clickhouse-server clickhouse-client
sudo systemctl start clickhouse-server
```

For Elasticsearch Storage

```bash
# Ubuntu/Debian
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
sudo apt-get install elasticsearch
sudo systemctl start elasticsearch
```

---

Quick Start

Configure Your Web Server (Nginx Example)

```bash
# Add to nginx.conf
log_format h3_json escape=json '{ "time": "$time_iso8601", "ip": "$remote_addr", "method": "$request_method", "url": "$request_uri", "status": "$status", "size": "$body_bytes_sent", "referer": "$http_referer", "userAgent": "$http_user_agent" }';

access_log syslog:server=127.0.0.1:5140,facility=local7,tag=nginx,severity=info h3_json;
```

Configuration File (config.yaml)

```yaml
input:
  - type: udp
    port: 5140
    format: nginx
  - type: file
    path: /var/log/caddy/access.log
    format: caddy
  - type: syslog
    port: 5514
    format: apache

output:
  type: clickhouse
  host: localhost
  port: 8123
  table: h3_logs

enrichment:
  geoip: true
  userAgent: true
  anomalyAlert: true

anomaly:
  threshold: 1000
  timeWindow: 60
  statusCodes: [403, 404, 500]
  alertWebhook: https://your-webhook-url
```

Start the Parser

```bash
# Start daemon mode
h3-log start --config ./config.yaml

# Live tail logs
h3-log tail --filter "status=404"

# Real-time statistics
h3-log stats --follow --filter "status >= 500"
```

Using as Library

```javascript
const { H3LogParser } = require('http3-log');

const parser = new H3LogParser({
  inputs: [
    { type: 'udp', port: 5140, format: 'nginx' },
    { type: 'file', path: '/var/log/caddy/access.log', format: 'caddy' }
  ],
  storage: {
    engine: 'clickhouse',
    host: '127.0.0.1',
    database: 'h3_historian'
  },
  enrichment: {
    geoip: true,
    userAgent: true,
    anomalyAlert: true
  }
});

parser.on('log', (data) => {
  console.log(`[${data.provider}] ${data.parsed.method} ${data.parsed.url} - ${data.parsed.status}`);
});

parser.start();
```

---

CLI Usage

Basic Commands

```bash
# Start parser in daemon mode
h3-log start --config ./config.yaml

# Start with custom UDP port
h3-log start --config ./config.yaml --port 5140

# Live tail logs
h3-log tail --config ./config.yaml

# Tail with filter
h3-log tail --filter "status=404"

# Real-time statistics
h3-log stats --config ./config.yaml

# Statistics with follow mode
h3-log stats --follow --filter "status >= 500"

# Parse existing log file
h3-log parse --file /var/log/nginx/access.log --format nginx --out report.json
```

Command Options

Command Alias Description
start - Start parser in daemon mode
tail - Live tail logs with filtering
stats - Show real-time statistics dashboard
parse - Parse log file in batch mode
--config -c Configuration file path (default: ./config.yaml)
--port -p UDP port to listen on
--filter - Filter expression (e.g., status=404 or status >= 500)
--follow - Follow mode for live updates
--file -f Log file path for batch parsing
--format - Log format (nginx, caddy, apache, etc)
--out -o Output file path (default: report.json)

---

Configuration Guide

Configuration File (config.yaml)

```yaml
input:
  - type: udp
    port: 5140
    format: nginx
  - type: tcp
    port: 5141
    format: caddy
  - type: syslog
    port: 5514
    format: apache
  - type: file
    path: /var/log/traefik/access.log
    format: traefik

output:
  type: clickhouse
  host: localhost
  port: 8123
  table: h3_logs
  # For Elasticsearch
  # type: elasticsearch
  # host: localhost
  # port: 9200
  # index: h3_logs

enrichment:
  geoip: true
  userAgent: true
  anomalyAlert: true

anomaly:
  threshold: 1000
  timeWindow: 60
  statusCodes: [403, 404, 500, 502, 503]
  alertWebhook: https://your-webhook-url
```

Programmatic Configuration

```javascript
const { H3LogParser } = require('http3-log');

const parser = new H3LogParser({
  inputs: [
    { type: 'udp', port: 5140, format: 'nginx' },
    { type: 'file', path: '/var/log/caddy/access.log', format: 'caddy' },
    { type: 'syslog', port: 5514, format: 'litespeed' }
  ],
  storage: {
    engine: 'clickhouse',
    host: '127.0.0.1',
    port: 8123,
    database: 'h3_historian'
  },
  enrichment: {
    geoip: true,
    userAgent: true,
    anomalyAlert: true
  },
  anomaly: {
    threshold: 500,
    timeWindow: 30,
    statusCodes: [403, 404, 429, 500],
    alertWebhook: 'https://hooks.slack.com/services/xxx'
  }
});
```

Configuration Parameters

Parameter Type Default Description
input.type string - Input source type: udp, tcp, syslog, file
input.port number - Port for UDP/TCP/Syslog input
input.path string - File path for file input
input.format string - Log format: nginx, caddy, apache, haproxy, traefik, envoy, cloudflare, aws_elb, aws_cloudfront, iis, litespeed
output.type string - Storage engine: clickhouse, elasticsearch
output.host string localhost Database host
output.port number - Database port
output.table string h3_logs ClickHouse table name
output.index string h3_logs Elasticsearch index name
enrichment.geoip boolean false Enable GeoIP enrichment
enrichment.userAgent boolean false Enable User-Agent parsing
enrichment.anomalyAlert boolean false Enable anomaly alerts
anomaly.threshold number 1000 Anomaly threshold count
anomaly.timeWindow number 60 Time window in seconds
anomaly.statusCodes array [] Status codes to monitor
anomaly.alertWebhook string "" Webhook URL for alerts

---

API Reference

H3LogParser Class

```javascript
const { H3LogParser } = require('http3-log');
```

Constructor

```javascript
const parser = new H3LogParser(config);
```

Parameters:

· config (object): Configuration object
· config.inputs (array): Array of input configurations
· config.storage (object): Storage configuration
· config.enrichment (object): Enrichment settings
· config.anomaly (object): Anomaly detection settings

Methods

Method Description
start() Start the parser (daemon mode)
stop() Stop the parser
parseFile(filePath, format) Parse existing log file and return results
on(event, callback) Register event listener

Events

Event Payload Description
log LogEntry Emitted when log is parsed and enriched
anomaly AnomalyData Emitted when anomaly is detected
error Error Emitted on error
started - Emitted when parser starts
stopped - Emitted when parser stops

LogEntry Object Structure

```typescript
{
  raw: string,
  parsed: {
    ip: string,
    method: string,
    url: string,
    status: number,
    size: number,
    referer: string,
    userAgent: string,
    responseTime: number
  },
  enriched: {
    geoip: {
      country: string,
      city: string,
      latitude: number,
      longitude: number,
      asn: string
    },
    userAgentParsed: {
      browser: string,
      os: string,
      device: string
    },
    anomaly: {
      isAnomaly: boolean,
      reason: string,
      severity: string
    }
  },
  provider: string,
  timestamp: Date
}
```

LogIngestor Class

```javascript
const { LogIngestor } = require('http3-log');
```

Methods

Method Description
start() Start all input listeners
stop() Stop all input listeners

PatternMatcher Class

```javascript
const { PatternMatcher } = require('http3-log');
```

Methods

Method Description
match(rawLog, provider) Match log against provider patterns
tryAutoDetect(rawLog) Auto-detect log format

Enricher Class

```javascript
const { Enricher } = require('http3-log');
```

Methods

Method Description
enrich(parsed) Enrich parsed log with GeoIP and User-Agent data

StorageManager Class

```javascript
const { StorageManager } = require('http3-log');
```

Methods

Method Description
connect() Connect to database
save(logEntry) Save log entry to database
disconnect() Disconnect from database

AnomalyDetector Class

```javascript
const { AnomalyDetector } = require('http3-log');
```

Methods

Method Description
check(logEntry) Check log for anomaly
alert(anomaly) Send alert to webhook

---

Usage Examples

Basic Log Parser with Multiple Inputs

```javascript
const { H3LogParser } = require('http3-log');

const parser = new H3LogParser({
  inputs: [
    { type: 'udp', port: 5140, format: 'nginx' },
    { type: 'file', path: '/var/log/caddy/access.log', format: 'caddy' },
    { type: 'syslog', port: 5514, format: 'apache' }
  ],
  storage: {
    engine: 'clickhouse',
    host: 'localhost',
    port: 8123,
    table: 'web_logs'
  },
  enrichment: {
    geoip: true,
    userAgent: true,
    anomalyAlert: false
  },
  anomaly: {
    threshold: 1000,
    timeWindow: 60,
    statusCodes: [403, 404, 500],
    alertWebhook: ''
  }
});

parser.on('log', (log) => {
  console.log(`[${log.provider}] ${log.parsed.method} ${log.parsed.url} - ${log.parsed.status}`);
  if (log.enriched.geoip) {
    console.log(`  Location: ${log.enriched.geoip.country}, ${log.enriched.geoip.city}`);
  }
  if (log.enriched.userAgentParsed) {
    console.log(`  Browser: ${log.enriched.userAgentParsed.browser} on ${log.enriched.userAgentParsed.os}`);
  }
});

parser.on('error', (error) => {
  console.error('Parser error:', error);
});

parser.start();

process.on('SIGINT', () => {
  parser.stop();
  process.exit(0);
});
```

Anomaly Detection with Alerts

```javascript
const { H3LogParser } = require('http3-log');

const parser = new H3LogParser({
  inputs: [
    { type: 'udp', port: 5140, format: 'nginx' }
  ],
  storage: {
    engine: 'clickhouse',
    host: 'localhost',
    table: 'web_logs'
  },
  enrichment: {
    geoip: true,
    userAgent: true,
    anomalyAlert: true
  },
  anomaly: {
    threshold: 500,
    timeWindow: 30,
    statusCodes: [403, 404, 429, 500, 502, 503],
    alertWebhook: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX'
  }
});

parser.on('anomaly', (anomaly) => {
  console.log('ANOMALY DETECTED!');
  console.log(`Reason: ${anomaly.reason}`);
  console.log(`Severity: ${anomaly.severity}`);
});

parser.start();
```

Batch Parse Log File

```javascript
const { H3LogParser } = require('http3-log');
const fs = require('fs');

async function analyzeLogs() {
  const parser = new H3LogParser({
    inputs: [],
    storage: { type: 'clickhouse', host: 'localhost', table: 'logs' },
    enrichment: { geoip: true, userAgent: true, anomalyAlert: false },
    anomaly: { threshold: 1000, timeWindow: 60, statusCodes: [], alertWebhook: '' }
  });

  const results = await parser.parseFile('/var/log/nginx/access.log', 'nginx');
  
  const statusCounts = {};
  results.forEach(log => {
    const status = log.parsed.status;
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  console.log('Status Code Distribution:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  const errors = results.filter(log => log.parsed.status >= 400);
  console.log(`\nTotal errors: ${errors.length}`);
  
  fs.writeFileSync('analysis.json', JSON.stringify(results, null, 2));
  console.log('Full analysis saved to analysis.json');
}

analyzeLogs().catch(console.error);
```

Custom Storage Integration

```javascript
const { H3LogParser } = require('http3-log');
const { Client } = require('pg');

class PostgresStorage {
  constructor(config) {
    this.client = new Client(config);
  }
  
  async connect() {
    await this.client.connect();
    await this.client.query(`
      CREATE TABLE IF NOT EXISTS h3_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP,
        ip INET,
        method VARCHAR(10),
        url TEXT,
        status INT,
        user_agent TEXT,
        country VARCHAR(2)
      )
    `);
  }
  
  async save(log) {
    const query = `
      INSERT INTO h3_logs (timestamp, ip, method, url, status, user_agent, country)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await this.client.query(query, [
      log.timestamp,
      log.parsed.ip,
      log.parsed.method,
      log.parsed.url,
      log.parsed.status,
      log.parsed.userAgent,
      log.enriched.geoip?.country
    ]);
  }
  
  async disconnect() {
    await this.client.end();
  }
}

const storage = new PostgresStorage({
  host: 'localhost',
  port: 5432,
  database: 'logs',
  user: 'postgres',
  password: 'password'
});

// Use custom storage by overriding the storage manager
// This requires extending the H3LogParser class
console.log('Custom PostgreSQL storage ready');
```

Docker Deployment

```dockerfile
FROM node:20-alpine

RUN apk add --no-cache tzdata

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY config.yaml ./

RUN adduser -D -u 1000 h3user
USER h3user

EXPOSE 5140/udp
EXPOSE 5514/udp

CMD ["node", "dist/cli.js", "start", "--config", "./config.yaml"]
```

Docker Compose

```yaml
version: '3.8'

services:
  h3-log:
    build: .
    container_name: h3-log-parser
    restart: unless-stopped
    ports:
      - "5140:5140/udp"
      - "5514:5514/udp"
    volumes:
      - ./config.yaml:/app/config.yaml
      - /var/log:/var/log:ro
    environment:
      - NODE_ENV=production
    logging:
      driver: json-file
      options:
        max-size: 10m
        max-file: 3

  clickhouse:
    image: clickhouse/clickhouse-server:latest
    container_name: clickhouse
    restart: unless-stopped
    ports:
      - "8123:8123"
      - "9000:9000"
    volumes:
      - clickhouse-data:/var/lib/clickhouse

volumes:
  clickhouse-data:
```

---

FAQ

Q1: What log formats are supported?

Answer: HTTP3-Log supports 11 log formats: Nginx (combined, json, error, stream), Caddy (json, common, combined, caddyLog), Apache (common, combined, vhost, error), HAProxy (httplog, tcplog), Traefik (common, json, access), Envoy (json, default, access), Cloudflare (json, edge, ray), AWS ELB (classic, application), AWS CloudFront (standard), IIS (w3c, iisLog), and LiteSpeed (combined, common).

Valid Data: The tool uses regex patterns and JSON parsing to extract fields from any log format.

---

Q2: How do I send logs from Nginx to the parser?

Answer: Configure Nginx with syslog output. Add to nginx.conf:

```nginx
log_format h3_json escape=json '{ "time": "$time_iso8601", "ip": "$remote_addr", "method": "$request_method", "url": "$request_uri", "status": "$status" }';
access_log syslog:server=127.0.0.1:5140,facility=local7,tag=nginx,severity=info h3_json;
```

Then restart Nginx. The parser will receive logs on UDP port 5140.

Valid Data: Nginx syslog module must be enabled (--with-http_syslog_module). Most distributions include it by default.

---

Q3: What databases are supported for storage?

Answer: ClickHouse and Elasticsearch are officially supported. ClickHouse is recommended for high-volume log storage and fast aggregation queries. Elasticsearch is suitable for full-text search and Kibana visualization.

Valid Data: ClickHouse can handle billions of rows with sub-second query times. Elasticsearch provides powerful search capabilities.

---

Q4: How does anomaly detection work?

Answer: The anomaly detector tracks HTTP status codes per IP address within a configurable time window. When an IP exceeds the threshold for a monitored status code (e.g., 1000 errors in 60 seconds), an anomaly is triggered and an alert is sent to the configured webhook.

Valid Data: The detector uses sliding time windows with automatic cleanup. Alerts are sent via HTTP POST to any webhook URL (Slack, Discord, Telegram bot, custom endpoint).

---

Q5: Can I use this without a database?

Answer: Yes, you can use the parser without database storage by omitting the storage configuration or using the event emitter to handle logs directly. The parseFile method returns results as JSON without storing them.

Valid Data: The parser works in event-driven mode. You can listen for 'log' events and handle logs however you want.

---

Q6: What is the performance impact on high traffic?

Answer: The parser processes logs asynchronously and can handle 10,000+ logs per second on modest hardware (2 CPU cores, 1GB RAM). For extremely high traffic (>50,000 logs/sec), consider using ClickHouse with batch inserts or multiple parser instances behind a load balancer.

Valid Data: Node.js event loop and async I/O allow efficient processing. ClickHouse batch inserts are optimized for high throughput.

---

Q7: How do I get GeoIP data?

Answer: Download the GeoLite2 City database from MaxMind (free) and place it in the working directory as GeoLite2-City.mmdb. Enable GeoIP enrichment in config:

```yaml
enrichment:
  geoip: true
```

Valid Data: MaxMind GeoLite2 is free for most use cases. The database provides country, city, latitude, longitude, and ASN information.

---

Q8: Can I parse existing log files?

Answer: Yes, use batch mode:

```bash
h3-log parse --file /var/log/nginx/access.log --format nginx --out analysis.json
```

The parser will read the entire file, parse each line, and output a JSON report.

Valid Data: Batch mode supports all 11 log formats and outputs enriched data including GeoIP and User-Agent parsing.

---

Terms of Service

Please read these Terms of Service carefully before using HTTP3-Log.

1. Acceptance of Terms

By downloading, installing, or using HTTP3-Log (the "Software"), you agree to be bound by these Terms of Service.

1. Intended Use

HTTP3-Log is designed for legitimate purposes including:

· Aggregating and analyzing logs from your own web servers
· Monitoring traffic on infrastructure you own or manage
· Detecting anomalies and security issues in your applications
· Debugging performance problems in your HTTP/3, HTTP/2, and HTTP/1.1 servers
· Generating reports and analytics for your own systems

1. Prohibited Uses

You agree NOT to use HTTP3-Log for:

· Processing logs from systems you do not own or have permission to monitor
· Storing or analyzing sensitive personal data without proper consent
· Any activity that violates data protection laws (GDPR, CCPA, etc)
· Attacking or probing third-party services
· Bypassing security controls or access restrictions

1. Responsibility and Liability

THE AUTHOR PROVIDES THIS SOFTWARE "AS IS" WITHOUT WARRANTIES. YOU BEAR FULL RESPONSIBILITY FOR YOUR ACTIONS. THE AUTHOR IS NOT LIABLE FOR ANY DAMAGES, LEGAL CONSEQUENCES, OR ANY OTHER OUTCOMES RESULTING FROM YOUR USE.

1. Legal Compliance

You agree to comply with all applicable laws in your jurisdiction regarding log collection, data processing, and privacy. This includes but is not limited to:

· General Data Protection Regulation (GDPR) in the EU
· California Consumer Privacy Act (CCPA) in the US
· Personal Data Protection Act (PDPA) in Singapore
· Local data retention and privacy laws

1. Data Privacy

HTTP3-Log does not send your data to external services unless you configure webhook alerts. All logs remain on your infrastructure. You are responsible for securing your database and ensuring compliance with privacy regulations.

1. No Warranty

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT.

1. Indemnification

You agree to indemnify and hold the Author harmless from any claims arising from your use of the Software.

1. Ethical Reminder

I built HTTP3-Log to help developers monitor their own infrastructure and debug web server issues. Please use this tool responsibly. Only process logs from systems you own or have permission to monitor. Respect user privacy and data protection laws. If you choose to misuse this tool, you alone bear the consequences.

---

License

MIT License

Copyright (c) 2026 Dimzxzzx07

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

<div align="center">
    <img src="https://i.imgur.com/aPSNrKE.png" alt="Dimzxzzx07 Logo" width="200">
    <br>
    <strong>Powered By Dimzxzzx07</strong>
    <br>
    <br>
    <a href="https://t.me/Dimzxzzx07">
        <img src="https://img.shields.io/badge/Telegram-Contact-26A5E4?style=for-the-badge&logo=telegram" alt="Telegram">
    </a>
    <a href="https://github.com/Dimzxzzx07">
        <img src="https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github" alt="GitHub">
    </a>
    <br>
    <br>
    <small>Copyright © 2026 Dimzxzzx07. All rights reserved.</small>
</div>