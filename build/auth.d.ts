export interface ConnectedAppOptions {
    clientId: string;
    secret: string;
    url: string;
    user: string;
    lifetime: number;
}
export declare function getAuthToken(options: ConnectedAppOptions, audience?: string): string;
//# sourceMappingURL=auth.d.ts.map