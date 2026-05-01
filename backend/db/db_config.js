require("dotenv").config();

let pool;

if (process.env.NODE_ENV === "production") {
  // POSTGRES (Render)
  const { Pool } = require("pg");

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  console.log("🟢 Usando PostgreSQL (produção)");
} else {
  // MYSQL (local)
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

module.exports = pool;