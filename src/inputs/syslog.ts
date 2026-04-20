import dgram from "dgram";

export class SyslogInput {
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
      let rawMessage = msg.toString();
      const syslogRegex = /^<\d+>\d+ (?:[a-z]+ +\d+ \d+:\d+:\d+) (\S+) (.*)$/i;
      const match = rawMessage.match(syslogRegex);
      
      if (match) {
        const messageContent = match[2];
        this.callback(messageContent);
      } else {
        this.callback(rawMessage);
      }
    });
    this.server.bind(this.port);
  }

  public stop(): void {
    this.server.close();
  }
}