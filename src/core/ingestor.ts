import dgram from "dgram";
import net from "net";
import fs from "fs";
import chokidar from "chokidar";
import { InputConfig } from "../types";

export class LogIngestor {
  private inputs: InputConfig[];
  private handlers: Map<string, any> = new Map();
  private logCallback: (log: string, provider: string) => void;

  constructor(inputs: InputConfig[], callback: (log: string, provider: string) => void) {
    this.inputs = inputs;
    this.logCallback = callback;
  }

  public async start(): Promise<void> {
    for (const input of this.inputs) {
      await this.setupInput(input);
    }
  }

  private async setupInput(input: InputConfig): Promise<void> {
    switch (input.type) {
      case "udp":
        this.setupUDP(input);
        break;
      case "tcp":
        this.setupTCP(input);
        break;
      case "file":
        this.setupFile(input);
        break;
      case "syslog":
        this.setupSyslog(input);
        break;
      default:
        throw new Error(`Unknown input type: ${input.type}`);
    }
  }

  private setupUDP(input: InputConfig): void {
    const server = dgram.createSocket("udp4");
    server.on("message", (msg) => {
      const log = msg.toString();
      this.logCallback(log, input.format);
    });
    if (input.port) {
      server.bind(input.port);
      this.handlers.set(`udp:${input.port}`, server);
    }
  }

  private setupTCP(input: InputConfig): void {
    const server = net.createServer((socket) => {
      socket.on("data", (data) => {
        const logs = data.toString().split("\n");
        logs.forEach((log) => {
          if (log.trim()) {
            this.logCallback(log, input.format);
          }
        });
      });
    });
    if (input.port) {
      server.listen(input.port);
      this.handlers.set(`tcp:${input.port}`, server);
    }
  }

  private setupFile(input: InputConfig): void {
    if (!input.path) {
      return;
    }

    const watcher = chokidar.watch(input.path, {
      persistent: true,
      usePolling: true
    });

    watcher.on("change", (path: string) => {
      const content = fs.readFileSync(path, "utf8");
      const lines = content.split("\n");
      const lastLine = lines[lines.length - 2];
      if (lastLine) {
        this.logCallback(lastLine, input.format);
      }
    });

    const initialContent = fs.readFileSync(input.path, "utf8");
    const lines = initialContent.split("\n");
    lines.forEach((line) => {
      if (line.trim()) {
        this.logCallback(line, input.format);
      }
    });

    this.handlers.set(`file:${input.path}`, watcher);
  }

  private setupSyslog(input: InputConfig): void {
    const server = dgram.createSocket("udp4");
    server.on("message", (msg) => {
      let log = msg.toString();
      const syslogRegex = /^<\d+>\d+ (?:[a-z]+ +\d+ \d+:\d+:\d+) (\S+) (.+)$/i;
      const match = log.match(syslogRegex);
      if (match) {
        log = match[2];
      }
      this.logCallback(log, input.format);
    });
    if (input.port) {
      server.bind(input.port);
      this.handlers.set(`syslog:${input.port}`, server);
    }
  }

  public async stop(): Promise<void> {
    for (const [key, handler] of this.handlers) {
      if (handler.close) {
        handler.close();
      } else if (handler.unwatch) {
        await handler.close();
      }
    }
    this.handlers.clear();
  }
}