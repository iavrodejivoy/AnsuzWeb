-- Таблица пользователей Ansuz
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  username   VARCHAR(50)  UNIQUE NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,   -- bcrypt hash
  first_name VARCHAR(100),
  last_name  VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
