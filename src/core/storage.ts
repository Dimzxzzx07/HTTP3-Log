import { LogEntry, OutputConfig } from "../types";
import { ClickHouse } from "clickhouse";
import { Client as ElasticsearchClient } from "@elastic/elasticsearch";

export class StorageManager {
  private config: OutputConfig;
  private clickhouse: any;
  private elasticsearch: any;

  constructor(config: OutputConfig) {
    this.config = config;
  }

  public async connect(): Promise<void> {
    if (this.config.type === "clickhouse") {
      this.clickhouse = new ClickHouse({
        host: this.config.host,
        port: this.config.port || 8123
      });
      await this.initClickhouseTable();
    } else if (this.config.type === "elasticsearch") {
      this.elasticsearch = new ElasticsearchClient({
        node: `http://${this.config.host}:${this.config.port || 9200}`
      });
      await this.initElasticsearchIndex();
    }
  }

  private async initClickhouseTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${this.config.table} (
        timestamp DateTime,
        ip String,
        method String,
        url String,
        status UInt16,
        size UInt32,
        referer String,
        userAgent String,
        responseTime Float32,
        provider String,
        country String,
        city String,
        browser String,
        os String
      ) ENGINE = MergeTree()
      ORDER BY timestamp
    `;
    await this.clickhouse.query(createTableQuery).toPromise();
  }

  private async initElasticsearchIndex(): Promise<void> {
    const exists = await this.elasticsearch.indices.exists({
      index: this.config.index || "h3_logs"
    });
    if (!exists) {
      await this.elasticsearch.indices.create({
        index: this.config.index || "h3_logs",
        body: {
          mappings: {
            properties: {
              timestamp: { type: "date" },
              ip: { type: "ip" },
              method: { type: "keyword" },
              url: { type: "text" },
              status: { type: "integer" },
              size: { type: "integer" },
              referer: { type: "keyword" },
              userAgent: { type: "text" },
              responseTime: { type: "float" },
              provider: { type: "keyword" },
              country: { type: "keyword" },
              city: { type: "keyword" },
              browser: { type: "keyword" },
              os: { type: "keyword" }
            }
          }
        }
      });
    }
  }

  public async save(log: LogEntry): Promise<void> {
    const doc = {
      timestamp: log.timestamp,
      ip: log.parsed.ip || "",
      method: log.parsed.method || "",
      url: log.parsed.url || "",
      status: log.parsed.status || 0,
      size: log.parsed.size || 0,
      referer: log.parsed.referer || "",
      userAgent: log.parsed.userAgent || "",
      responseTime: log.parsed.responseTime || 0,
      provider: log.provider,
      country: log.enriched.geoip?.country || "",
      city: log.enriched.geoip?.city || "",
      browser: log.enriched.userAgentParsed?.browser || "",
      os: log.enriched.userAgentParsed?.os || ""
    };

    if (this.config.type === "clickhouse" && this.clickhouse) {
      await this.clickhouse.insert(`INSERT INTO ${this.config.table} FORMAT JSONEachRow`, [doc]).toPromise();
    } else if (this.config.type === "elasticsearch" && this.elasticsearch) {
      await this.elasticsearch.index({
        index: this.config.index || "h3_logs",
        body: doc
      });
    }
  }

  public async disconnect(): Promise<void> {
    if (this.clickhouse) {
      await this.clickhouse.disconnect();
    }
    if (this.elasticsearch) {
      await this.elasticsearch.close();
    }
  }
}