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
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10
  });

  // Adiciona isso logo abaixo:
  pool.on('connection', (conn) => {
    conn.query("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");
  });
  console.log("🟡 Usando MySQL (local)");
}

// Wrapper que funciona nos dois bancos
const db = {
  query: (sql, params = []) => {
    if (isProduction) {
      return pool.query(sql, params).then(r => r.rows);
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