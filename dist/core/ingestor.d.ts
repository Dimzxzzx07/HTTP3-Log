import { InputConfig } from "../types";
export declare class LogIngestor {
    private inputs;
    private handlers;
    private logCallback;
    constructor(inputs: InputConfig[], callback: (log: string, provider: string) => void);
    start(): Promise<void>;
    private setupInput;
    private setupUDP;
    private setupTCP;
    private setupFile;
    private setupSyslog;
    stop(): Promise<void>;
}
