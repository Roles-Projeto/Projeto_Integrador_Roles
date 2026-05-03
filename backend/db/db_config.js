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
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
  });
  console.log("🟡 Usando MySQL (local)");
}

// Wrapper que funciona nos dois bancos
const db = {
  query: (sql, params, callback) => {
    if (typeof params === "function") {
      callback = params;
      params = [];
    }

    if (isProduction) {
      let i = 0;
      const pgSql = sql
        .replace(/\?/g, () => `$${++i}`)
        .replace(/GROUP_CONCAT\((.+?)\s+SEPARATOR\s+'.+?'\)/gi, "STRING_AGG($1::text, ',')")
        .replace(/`/g, '"');

      pool.query(pgSql, params || [])
        .then(result => {
          const rows = result.rows;
          if (result.rows[0]?.id) rows.insertId = result.rows[0].id;
          callback(null, rows);
        })
        .catch(err => callback(err, null));
    } else {
      pool.query(sql, params, callback);
    }
  }
};

module.exports = db;