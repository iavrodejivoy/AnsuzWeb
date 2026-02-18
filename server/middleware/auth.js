const jwt = require("jsonwebtoken");
require("dotenv").config({ path: __dirname + "/../.env" });

/**
 * Middleware: проверяет JWT из заголовка Authorization: Bearer <token>
 * При успехе добавляет req.user = { id, username, email, firstName, lastName }
 */
function requireAuth(req, res, next) {
  const header = req.headers["authorization"] || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Требуется авторизация." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Токен недействителен или истёк." });
  }
}

module.exports = { requireAuth };
