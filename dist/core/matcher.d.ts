export declare class PatternMatcher {
    private patterns;
    constructor();
    match(rawLog: string, provider: string): any;
    private tryAutoDetect;
    private parseJson;
    private normalizeFields;
}
