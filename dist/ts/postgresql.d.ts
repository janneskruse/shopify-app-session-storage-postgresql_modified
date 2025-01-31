import { Session } from '@shopify/shopify-api';
import { SessionStorage, RdbmsSessionStorageOptions } from '@shopify/shopify-app-session-storage';
export interface PostgreSQLSessionStorageOptions extends RdbmsSessionStorageOptions {
    port: number;
}

type TsslOptions = {
    rejectUnauthorized: boolean;
    ca?: string;
} 

export declare class PostgreSQLSessionStorage implements SessionStorage {
    static withCredentials(host: string, dbName: string, username: string, password: string, sslOptions?:TsslOptions,  opts: Partial<PostgreSQLSessionStorageOptions>): PostgreSQLSessionStorage;
    readonly ready: Promise<void>;
    private internalInit;
    private options;
    private client;
    private migrator;
    constructor(dbUrl: URL | string, sslOptions?:TsslOptions, opts?: Partial<PostgreSQLSessionStorageOptions>);
    storeSession(session: Session): Promise<boolean>;
    loadSession(id: string): Promise<Session | undefined>;
    deleteSession(id: string): Promise<boolean>;
    deleteSessions(ids: string[]): Promise<boolean>;
    findSessionsByShop(shop: string): Promise<Session[]>;
    disconnect(): Promise<void>;
    private init;
    private connectClient;
    private createTable;
    private databaseRowToSession;
}
//# sourceMappingURL=postgresql.d.ts.map