#!/usr/bin/env node
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
const commander_1 = require("commander");
const fs_1 = __importDefault(require("fs"));
const yaml_1 = __importDefault(require("yaml"));
const blessed_1 = __importDefault(require("blessed"));
const parser_1 = require("./core/parser");
const program = new commander_1.Command();
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
    const configContent = fs_1.default.readFileSync(options.config, "utf8");
    const config = yaml_1.default.parse(configContent);
    if (options.port) {
        config.input.push({
            type: "udp",
            port: parseInt(options.port),
            format: "nginx_json"
        });
    }
    const parser = new parser_1.H3LogParser(config);
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
    const { H3LogParser } = await Promise.resolve().then(() => __importStar(require("./core/parser")));
    const config = {
        input: [],
        output: { type: "clickhouse", host: "localhost", table: "h3_logs" },
        enrichment: { geoip: false, userAgent: false, anomalyAlert: false },
        anomaly: { threshold: 1000, timeWindow: 60, statusCodes: [], alertWebhook: "" }
    };
    const parser = new H3LogParser(config);
    const results = await parser.parseFile(options.file, options.format);
    fs_1.default.writeFileSync(options.out, JSON.stringify(results, null, 2));
    console.log(`Parsed ${results.length} logs to ${options.out}`);
});
program
    .command("tail")
    .description("Live tail logs with filtering")
    .option("-c, --config <path>", "Configuration file path", "./config.yaml")
    .option("--filter <filter>", "Filter expression (e.g., status=404)")
    .action(async (options) => {
    const configContent = fs_1.default.readFileSync(options.config, "utf8");
    const config = yaml_1.default.parse(configContent);
    const parser = new parser_1.H3LogParser(config);
    let filterField = null;
    let filterValue = null;
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
    const configContent = fs_1.default.readFileSync(options.config, "utf8");
    const config = yaml_1.default.parse(configContent);
    const parser = new parser_1.H3LogParser(config);
    const screen = blessed_1.default.screen({
        smartCSR: true,
        title: "H3-Log Statistics"
    });
    const box = blessed_1.default.box({
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
        byStatus: {},
        byProvider: {}
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
    function updateDisplay() {
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
