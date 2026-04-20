require("dotenv").config();

const { Pool } = require("pg");

const isProd = !!process.env.DATABASE_URL;

let pool;

if (isProd) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  console.log("🟢 PostgreSQL (Render)");
} else {
  const mysql = require("mysql2");

  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log("🟡 MySQL (local)");
}

module.exports = pool;