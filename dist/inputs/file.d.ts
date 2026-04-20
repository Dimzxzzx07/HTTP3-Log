export declare class FileInput {
    private watcher;
    private path;
    private callback;
    private lastPosition;
    constructor(path: string, callback: (log: string) => void);
    start(): void;
    stop(): void;
}
