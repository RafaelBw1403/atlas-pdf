import Database from 'better-sqlite3';


interface IRateLimitStore {
    checkAndIncrement(key: string, limit: number, windowMs: number): { 
        allowed: boolean; 
        remaining: number; 
        retryAfter: number 
    };
}

class SQLiteRateLimitStore implements IRateLimitStore {
    private db: Database.Database;

    constructor() {
        this.db = new Database('rate_limit.db');
        this.init();
    }

    private init() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS rate_limits (
                key TEXT,
                timestamp INTEGER
            );
            CREATE INDEX IF NOT EXISTS idx_key_timestamp ON rate_limits (key, timestamp);
        `);
    }

    checkAndIncrement(key: string, limit: number, windowMs: number) {
        // Validación de variable de entorno para bypass
        if (process.env.ENABLE_RATE_LIMIT === 'false') {
            return {
                allowed: true,
                remaining: limit,
                retryAfter: 0
            };
        }
        const now = Date.now();
        const windowStart = now - windowMs;

        // 1. Limpiar registros antiguos
        this.db.prepare('DELETE FROM rate_limits WHERE timestamp < ?').run(windowStart);

        // 2. Contar peticiones actuales (Sliding Window Log)
        const logs = this.db.prepare(
            'SELECT timestamp FROM rate_limits WHERE key = ? ORDER BY timestamp ASC'
        ).all(key) as { timestamp: number }[];

        if (logs.length >= limit) {
        // Obtenemos el registro más viejo de forma segura
        const oldestLog = logs[0];

        if (!oldestLog) {
                // Caso de seguridad: si por algo extraño no hay logs, 
                // reseteamos y permitimos la petición.
                return { allowed: true, remaining: limit, retryAfter: 0 };
            }

            const retryAfterMs = (oldestLog.timestamp + windowMs) - now;
            
            return {
                allowed: false,
                remaining: 0,
                retryAfter: Math.ceil(retryAfterMs / 1000)
            };
        }

        // 3. Registrar nueva petición
        this.db.prepare('INSERT INTO rate_limits (key, timestamp) VALUES (?, ?)').run(key, now);

        return {
            allowed: true,
            remaining: limit - (logs.length + 1),
            retryAfter: 0
        };
    }
}

export const RateLimitService = new SQLiteRateLimitStore();