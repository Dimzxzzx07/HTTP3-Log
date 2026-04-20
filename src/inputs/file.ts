import fs from "fs";
import chokidar from "chokidar";

export class FileInput {
  private watcher: any;
  private path: string;
  private callback: (log: string) => void;
  private lastPosition: number;

  constructor(path: string, callback: (log: string) => void) {
    this.path = path;
    this.callback = callback;
    this.lastPosition = 0;
  }

  public start(): void {
    const stats = fs.statSync(this.path);
    this.lastPosition = stats.size;

    const content = fs.readFileSync(this.path, "utf8");
    const lines = content.split("\n");
    lines.forEach((line) => {
      if (line.trim()) {
        this.callback(line);
      }
    });

    this.watcher = chokidar.watch(this.path, {
      persistent: true,
      usePolling: true
    });

    this.watcher.on("change", () => {
      const newStats = fs.statSync(this.path);
      if (newStats.size > this.lastPosition) {
        const buffer = Buffer.alloc(newStats.size - this.lastPosition);
        const fd = fs.openSync(this.path, "r");
        fs.readSync(fd, buffer, 0, buffer.length, this.lastPosition);
        fs.closeSync(fd);
        
        const newContent = buffer.toString();
        const lines = newContent.split("\n");
        lines.forEach((line) => {
          if (line.trim()) {
            this.callback(line);
          }
        });
        this.lastPosition = newStats.size;
      }
    });
  }

  public stop(): void {
    if (this.watcher) {
      this.watcher.close();
    }
  }
}