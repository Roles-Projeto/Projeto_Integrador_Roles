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

/* Converte ? → $1, $2... */
function converterParams(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

/* Converte sintaxe MySQL → PostgreSQL (só roda em produção) */
function converterSQL(sql) {
  if (!isProduction) return sql;

  let result = sql
    .replace(/GROUP_CONCAT\((.+?)\s+SEPARATOR\s+'(.+?)'\)/gi, "STRING_AGG($1, '$2')")
    .replace(/GROUP_CONCAT\((.+?)\)/gi, "STRING_AGG($1, ',')")
    .replace(/IFNULL\(/gi, "COALESCE(");

  // Adiciona RETURNING id em INSERTs automaticamente
  if (/^\s*INSERT\s+/i.test(result) && !/RETURNING/i.test(result)) {
    result = result.trimEnd().replace(/;?\s*$/, '') + ' RETURNING id';
  }

  return result;
}

const db = {
  query: (sql, params = [], callback) => {

    // ── MODO CALLBACK ──────────────────────────────────
    if (typeof callback === 'function') {
      if (isProduction) {
        const pgSql = converterParams(converterSQL(sql));
        pool.query(pgSql, params)
          .then(r => {
            const rows = r.rows;
            // Simula insertId para controllers que usam results.insertId
            if (r.command === 'INSERT' && rows.length > 0 && rows[0].id) {
              rows.insertId = rows[0].id;
            }
            callback(null, rows);
          })
          .catch(err => callback(err));
      } else {
        pool.query(sql, params, callback);
      }
      return;
    }

    // ── MODO PROMISE / ASYNC-AWAIT ─────────────────────
    if (isProduction) {
      const pgSql = converterParams(converterSQL(sql));
      return pool.query(pgSql, params).then(r => {
        const rows = r.rows;
        if (r.command === 'INSERT' && rows.length > 0 && rows[0].id) {
          rows.insertId = rows[0].id;
        }
        return rows;
      });
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