#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs";
import yaml from "yaml";
import blessed from "blessed";
import { H3LogParser } from "./core/parser";
import { Config } from "./types";

const program = new Command();

program
  .name("h3-log")
  .description("High performance log parser for HTTP/3 and web servers")
  .version("1.0.0");

program
  .command("start")
  .description("Start parser in daemon mode")
  .option("-c, --config <path>", "Configuration file path", "./config.yaml")
  .option("-p, --port <port>", "UDP port to listen on")
  .action(async (options) => {
    const configContent = fs.readFileSync(options.config, "utf8");
    const config = yaml.parse(configContent) as Config;

    if (options.port) {
      config.input.push({
        type: "udp",
        port: parseInt(options.port),
        format: "nginx_json"
      });
    }

    const parser = new H3LogParser(config);

    parser.on("log", (log) => {
      console.log(`[${log.provider}] ${log.parsed.method} ${log.parsed.url} - ${log.parsed.status}`);
    });

    parser.on("anomaly", (anomaly) => {
      console.error("ANOMALY DETECTED:", anomaly.reason);
    });

    parser.on("error", (error) => {
      console.error("Error:", error.message);
    });

    await parser.start();
    console.log("H3-Log parser started");
  });

program
  .command("parse")
  .description("Parse log file in batch mode")
  .option("-f, --file <path>", "Log file path")
  .option("--format <format>", "Log format (nginx, caddy, apache, etc)")
  .option("-o, --out <path>", "Output file path", "report.json")
  .action(async (options) => {
    const { H3LogParser } = await import("./core/parser");
    const config: Config = {
      input: [],
      output: { type: "clickhouse", host: "localhost", table: "h3_logs" },
      enrichment: { geoip: false, userAgent: false, anomalyAlert: false },
      anomaly: { threshold: 1000, timeWindow: 60, statusCodes: [], alertWebhook: "" }
    };

    const parser = new H3LogParser(config);
    const results = await parser.parseFile(options.file, options.format);
    fs.writeFileSync(options.out, JSON.stringify(results, null, 2));
    console.log(`Parsed ${results.length} logs to ${options.out}`);
  });

program
  .command("tail")
  .description("Live tail logs with filtering")
  .option("-c, --config <path>", "Configuration file path", "./config.yaml")
  .option("--filter <filter>", "Filter expression (e.g., status=404)")
  .action(async (options) => {
    const configContent = fs.readFileSync(options.config, "utf8");
    const config = yaml.parse(configContent) as Config;
    const parser = new H3LogParser(config);

    let filterField: string | null = null;
    let filterValue: string | null = null;

    if (options.filter) {
      const [field, value] = options.filter.split("=");
      filterField = field;
      filterValue = value;
    }

    parser.on("log", (log) => {
      if (filterField && filterValue) {
        const fieldValue = log.parsed[filterField];
        if (fieldValue && fieldValue.toString() !== filterValue) {
          return;
        }
      }
      console.log(`[${new Date().toISOString()}] ${log.provider} | ${log.parsed.method} ${log.parsed.url} | ${log.parsed.status}`);
    });

    await parser.start();
  });

program
  .command("stats")
  .description("Show real-time statistics")
  .option("-c, --config <path>", "Configuration file path", "./config.yaml")
  .option("--follow", "Follow mode (live updates)")
  .option("--filter <filter>", "Filter expression (e.g., status >= 500)")
  .action(async (options) => {
    const configContent = fs.readFileSync(options.config, "utf8");
    const config = yaml.parse(configContent) as Config;
    const parser = new H3LogParser(config);

    const screen = blessed.screen({
      smartCSR: true,
      title: "H3-Log Statistics"
    });

    const box = blessed.box({
      top: "center",
      left: "center",
      width: "90%",
      height: "90%",
      content: "Loading statistics...",
      tags: true,
      border: {
        type: "line"
      },
      style: {
        fg: "white",
        bg: "black",
        border: {
          fg: "#f0f0f0"
        }
      }
    });

    screen.append(box);

    const stats = {
      total: 0,
      byStatus: {} as Record<string, number>,
      byProvider: {} as Record<string, number>
    };

    parser.on("log", (log) => {
      const status = log.parsed.status ? log.parsed.status.toString() : "unknown";
      const provider = log.provider;

      stats.total++;
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      stats.byProvider[provider] = (stats.byProvider[provider] || 0) + 1;

      if (options.follow) {
        updateDisplay();
      }
    });

    function updateDisplay(): void {
      let content = "H3-Log Real-Time Statistics\n\n";
      content += `Total Logs: ${stats.total}\n\n`;
      content += "Status Codes:\n";
      Object.entries(stats.byStatus)
        .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
        .forEach(([code, count]) => {
          content += `  ${code}: ${count}\n`;
        });
      content += "\nProviders:\n";
      Object.entries(stats.byProvider).forEach(([provider, count]) => {
        content += `  ${provider}: ${count}\n`;
      });
      box.setContent(content);
      screen.render();
    }

    if (!options.follow) {
      setTimeout(() => {
        updateDisplay();
      }, 1000);
    }

    screen.key(["q", "C-c"], () => {
      process.exit(0);
    });

    await parser.start();
    screen.render();
  });

program.parse();