require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");
const pool = require("./db");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    // Разрешаем запросы с файлов (file://) и localhost-фронтенда
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.get("/api/health", (_req, res) => res.json({ ok: true }));

async function start() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id             SERIAL PRIMARY KEY,
        username       VARCHAR(50)  UNIQUE NOT NULL,
        email          VARCHAR(255) UNIQUE NOT NULL,
        password       VARCHAR(255) NOT NULL,
        first_name     VARCHAR(100),
        last_name      VARCHAR(100),
        created_at     TIMESTAMP DEFAULT NOW(),
        is_premium     BOOLEAN   DEFAULT FALSE NOT NULL,
        premium_since  TIMESTAMP DEFAULT NULL,
        premium_until  TIMESTAMP DEFAULT NULL)
    `);

    await pool.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE NOT NULL`,
    );
    await pool.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_since TIMESTAMP DEFAULT NULL`,
    );
    await pool.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_until TIMESTAMP DEFAULT NULL`,
    );
    console.log("БД подключена, таблица users готова.");

    app.listen(PORT, () => {
      console.log(`Сервер запущен: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Ошибка запуска:", err.message);
    process.exit(1);
  }
}

start();
