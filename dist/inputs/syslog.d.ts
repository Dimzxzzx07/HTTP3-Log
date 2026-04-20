export declare class SyslogInput {
    private server;
    private port;
    private callback;
    constructor(port: number, callback: (log: string) => void);
    start(): void;
    stop(): void;
}
