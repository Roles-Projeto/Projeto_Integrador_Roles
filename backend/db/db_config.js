require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";
let pool;

if (isProduction) {
  const { Pool } = require("pg");
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  console.log("🟢 Usando PostgreSQL (produção)");
} else {
  const mysql = require("mysql2");
  pool = mysql.createPool({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset:  'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10
  });
  pool.on('connection', (conn) => {
    conn.query("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");
  });
  console.log("🟡 Usando MySQL (local)");
}

/* Converte ? para $1, $2, $3... (necessário para PostgreSQL) */
function converterParams(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

const db = {
  /**
   * Funciona nos dois estilos:
   *
   * 1) COM CALLBACK (controllers antigos):
   *    db.query(sql, params, (err, results) => { ... })
   *
   * 2) COM ASYNC/AWAIT (controllers novos):
   *    const results = await db.query(sql, params)
   *
   * Funciona com MySQL (local) e PostgreSQL (produção/Render).
   * Os ? são convertidos automaticamente para $1,$2... no PostgreSQL.
   */
  query: (sql, params = [], callback) => {

    // ── MODO CALLBACK ──────────────────────────────────
    if (typeof callback === 'function') {
      if (isProduction) {
        const pgSql = converterParams(sql);
        pool.query(pgSql, params)
          .then(r => callback(null, r.rows))
          .catch(err => callback(err));
      } else {
        pool.query(sql, params, callback);
      }
      return;
    }

    // ── MODO PROMISE / ASYNC-AWAIT ─────────────────────
    if (isProduction) {
      const pgSql = converterParams(sql);
      return pool.query(pgSql, params).then(r => r.rows);
    } else {
      return new Promise((resolve, reject) => {
        pool.query(sql, params, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
    }
  }
};

module.exports = db;