import dgram from "dgram";

export class UDPInput {
  private server: dgram.Socket;
  private port: number;
  private callback: (log: string) => void;

  constructor(port: number, callback: (log: string) => void) {
    this.port = port;
    this.callback = callback;
    this.server = dgram.createSocket("udp4");
  }

  public start(): void {
    this.server.on("message", (msg) => {
      const log = msg.toString();
      this.callback(log);
    });
    this.server.bind(this.port);
  }

  public stop(): void {
    this.server.close();
  }
}