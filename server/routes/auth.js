const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

require("dotenv").config({ path: __dirname + "/../.env" });

const router = express.Router();
const SALT_ROUNDS = 10;

/* Генерирует JWT */
function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      isPremium: user.is_premium || false,
      premiumUntil: user.premium_until || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "username, email и password обязательны." });
  }

  try {
    const existing = await pool.query(
      "SELECT id, email, username FROM users WHERE email = $1 OR username = $2",
      [email, username],
    );

    if (existing.rows.length > 0) {
      const dup = existing.rows[0];
      if (dup.email === email) {
        return res
          .status(409)
          .json({ error: "Пользователь с таким email уже существует." });
      }
      return res
        .status(409)
        .json({ error: "Пользователь с таким именем уже существует." });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (username, email, password, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, first_name, last_name`,
      [username, email, hash, firstName || null, lastName || null],
    );

    const user = result.rows[0];
    const token = signToken(user);

    return res.status(201).json({
      user: {
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      token,
    });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ error: "Внутренняя ошибка сервера." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email и password обязательны." });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Неверный email или пароль." });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Неверный email или пароль." });
    }

    const token = signToken(user);

    return res.json({
      user: {
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isPremium: user.is_premium || false,
        premiumUntil: user.premium_until || null,
      },
      token,
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Внутренняя ошибка сервера." });
  }
});

// PATCH /api/auth/profile
router.patch("/profile", requireAuth, async (req, res) => {
  const { username, email, firstName, lastName } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: "username и email обязательны." });
  }

  try {
    const conflict = await pool.query(
      "SELECT id, email, username FROM users WHERE (email = $1 OR username = $2) AND id != $3",
      [email, username, req.user.id],
    );

    if (conflict.rows.length > 0) {
      const dup = conflict.rows[0];
      if (dup.email === email) {
        return res
          .status(409)
          .json({ error: "Этот email уже используется другим пользователем." });
      }
      return res
        .status(409)
        .json({ error: "Это имя пользователя уже занято." });
    }

    const result = await pool.query(
      `UPDATE users
       SET username = $1, email = $2, first_name = $3, last_name = $4
       WHERE id = $5
       RETURNING id, username, email, first_name, last_name`,
      [username, email, firstName || null, lastName || null, req.user.id],
    );

    const user = result.rows[0];
    const token = signToken(user);

    return res.json({
      user: {
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      token,
    });
  } catch (err) {
    console.error("profile update error:", err);
    return res.status(500).json({ error: "Внутренняя ошибка сервера." });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, first_name, last_name, is_premium, premium_since, premium_until FROM users WHERE id = $1",
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден." });
    }

    const user = result.rows[0];
    return res.json({
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      isPremium: user.is_premium || false,
      premiumUntil: user.premium_until || null,
    });
  } catch (err) {
    console.error("me error:", err);
    return res.status(500).json({ error: "Внутренняя ошибка сервера." });
  }
});

// POST /api/auth/premium — активация премиума на 1 месяц
router.post("/premium", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE users
       SET is_premium = TRUE,
           premium_since = NOW(),
           premium_until = NOW() + INTERVAL '1 month'
       WHERE id = $1
       RETURNING id, username, email, first_name, last_name, is_premium, premium_since, premium_until`,
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден." });
    }

    const user = result.rows[0];
    const token = signToken(user);

    return res.json({
      user: {
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isPremium: user.is_premium,
        premiumUntil: user.premium_until,
      },
      token,
    });
  } catch (err) {
    console.error("premium activation error:", err);
    return res.status(500).json({ error: "Внутренняя ошибка сервера." });
  }
});

module.exports = router;
