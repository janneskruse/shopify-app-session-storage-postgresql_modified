import pg from 'pg';

class PostgresConnection {
    sessionStorageIdentifier;
    ready;
    pool;
    dbUrl;
    constructor(dbUrl, sessionStorageIdentifier, sslOptions) {
        this.dbUrl = new URL(dbUrl);
        this.sslOptions = sslOptions;
        this.ready = this.init();
        this.sessionStorageIdentifier = sessionStorageIdentifier;
    }
    async query(query, params = []) {
        await this.ready;
        return (await this.pool.query(query, params)).rows;
    }
    /**
     * Runs a series of queries in a transaction - requires the use of a SINGLE client,
     * hence we can't use the query method above.
     *
     * @param queries an array of SQL queries to execute in a transaction
     */
    async transaction(queries) {
        await this.ready;
        // check if the first and last queries are BEGIN and COMMIT, if not, add them
        if (queries[0] !== 'BEGIN') {
            queries.unshift('BEGIN');
        }
        if (queries[queries.length - 1] !== 'COMMIT') {
            queries.push('COMMIT');
        }
        const client = await this.pool.connect();
        try {
            for (const query of queries) {
                await client.query(query);
            }
        }
        catch (error) {
            // rollback if any of the queries fail
            await client.query(`ROLLBACK`);
            throw error;
        }
        finally {
            client.release();
        }
    }
    async disconnect() {
        // Since no longer using individual client, use disconnect to reset the pool.
        await this.ready;
        await this.pool.end();
        this.ready = this.init();
    }
    async connect() {
        await this.ready;
    }
    getDatabase() {
        return decodeURIComponent(this.dbUrl.pathname.slice(1));
    }
    async hasTable(tablename) {
        await this.ready;
        const query = `
      SELECT EXISTS (
        SELECT tablename FROM pg_catalog.pg_tables
          WHERE tablename = ${this.getArgumentPlaceholder(1)}
      )
  `;
        // Allow multiple apps to be on the same host with separate DB and querying the right
        // DB for the session table exisitence
        const rows = await this.query(query, [tablename]);
        return rows[0].exists;
    }
    getArgumentPlaceholder(position) {
        return `$${position}`;
    }
    async init() {
        const ca = this.sslOptions?.ca //?.replace(/\\n/g, '\n');
        
        console.log('Initializing database connection...', ca)
        this.pool = new pg.Pool({
            host: this.dbUrl.hostname,
            user: decodeURIComponent(this.dbUrl.username),
            password: decodeURIComponent(this.dbUrl.password),
            database: this.getDatabase(),
            port: Number(this.dbUrl.port),
            ssl: this.sslOptions ? {
                rejectUnauthorized: this.sslOptions.rejectUnauthorized ?? true,
                ca: ca,
            } : undefined,
        });
    }
}

export { PostgresConnection };
//# sourceMappingURL=postgres-connection.mjs.map
