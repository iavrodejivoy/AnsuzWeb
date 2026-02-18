/*
 * auth.js — логика авторизации и регистрации.
 *
 * Сейчас используется mockProvider (localStorage + MOCK_USERS).
 * Для перехода на PostgreSQL: реализуйте apiProvider (fetch к REST API)
 * и замените одну строку в конце файла:
 *   window.authProvider = mockProvider;  →  window.authProvider = apiProvider;
 */

// ─── Mock-провайдер (localStorage) ───────────────────────────────────────────

const mockProvider = {
  /*
   * Инициализация: копирует MOCK_USERS в localStorage (если там пусто).
   */
  init() {
    if (!localStorage.getItem("ansuz_users")) {
      localStorage.setItem("ansuz_users", JSON.stringify(MOCK_USERS));
    }
  },

  getUsers() {
    return JSON.parse(localStorage.getItem("ansuz_users") || "[]");
  },

  saveUsers(users) {
    localStorage.setItem("ansuz_users", JSON.stringify(users));
  },

  /**
   * Вход по email + password.
   * @returns {{ ok: boolean, user?: object, error?: string }}
   */
  login(email, password) {
    const users = this.getUsers();
    const user = users.find(
      (u) => u.email === email && u.password === password,
    );
    if (!user) {
      return { ok: false, error: "Неверный email или пароль." };
    }

    const session = {
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    localStorage.setItem("ansuz_session", JSON.stringify(session));
    return { ok: true, user: session };
  },

  /**
   * Регистрация нового пользователя.
   * @returns {{ ok: boolean, user?: object, error?: string }}
   */
  register({ username, email, password, firstName, lastName }) {
    const users = this.getUsers();

    if (users.find((u) => u.email === email)) {
      return { ok: false, error: "Пользователь с таким email уже существует." };
    }
    if (users.find((u) => u.username === username)) {
      return {
        ok: false,
        error: "Пользователь с таким именем уже существует.",
      };
    }

    const newUser = { username, email, password, firstName, lastName };
    users.push(newUser);
    this.saveUsers(users);

    const session = { username, email, firstName, lastName };
    localStorage.setItem("ansuz_session", JSON.stringify(session));
    return { ok: true, user: session };
  },

  logout() {
    localStorage.removeItem("ansuz_session");
  },

  currentUser() {
    const raw = localStorage.getItem("ansuz_session");
    return raw ? JSON.parse(raw) : null;
  },
};

// API-провайдер (PostgreSQL через REST API)

const API_BASE = "http://localhost:3001/api";

const apiProvider = {
  init() {
    // сервер стартует сам
  },

  /**
   * Вход по email + password.
   * @returns {{ ok: boolean, user?: object, error?: string }}
   */
  async login(email, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error };

      localStorage.setItem("ansuz_token", data.token);
      localStorage.setItem("ansuz_session", JSON.stringify(data.user));
      return { ok: true, user: data.user };
    } catch {
      return { ok: false, error: "Сервер недоступен. Попробуйте позже." };
    }
  },

  /**
   * Регистрация нового пользователя.
   * @returns {{ ok: boolean, user?: object, error?: string }}
   */
  async register({ username, email, password, firstName, lastName }) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          firstName,
          lastName,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error };

      localStorage.setItem("ansuz_token", data.token);
      localStorage.setItem("ansuz_session", JSON.stringify(data.user));
      return { ok: true, user: data.user };
    } catch {
      return { ok: false, error: "Сервер недоступен. Попробуйте позже." };
    }
  },

  logout() {
    localStorage.removeItem("ansuz_session");
    localStorage.removeItem("ansuz_token");
  },

  currentUser() {
    const raw = localStorage.getItem("ansuz_session");
    return raw ? JSON.parse(raw) : null;
  },

  /**
   * Обновление профиля (username, email, firstName, lastName).
   * @returns {{ ok: boolean, user?: object, error?: string }}
   */
  async updateProfile({ username, email, firstName, lastName }) {
    const token = this.getToken();
    if (!token) return { ok: false, error: "Не авторизован." };

    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, email, firstName, lastName }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error };

      localStorage.setItem("ansuz_token", data.token);
      localStorage.setItem("ansuz_session", JSON.stringify(data.user));
      return { ok: true, user: data.user };
    } catch {
      return { ok: false, error: "Сервер недоступен. Попробуйте позже." };
    }
  },

  /**
   * Активация премиума на 1 месяц.
   * @returns {{ ok: boolean, user?: object, error?: string }}
   */
  async activatePremium() {
    const token = this.getToken();
    if (!token) return { ok: false, error: "Не авторизован." };

    try {
      const res = await fetch(`${API_BASE}/auth/premium`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error };

      localStorage.setItem("ansuz_token", data.token);
      localStorage.setItem("ansuz_session", JSON.stringify(data.user));
      return { ok: true, user: data.user };
    } catch {
      return { ok: false, error: "Сервер недоступен. Попробуйте позже." };
    }
  },

  // Возвращает JWT-токен
  getToken() {
    return localStorage.getItem("ansuz_token");
  },
};

window.authProvider = apiProvider;
window.authProvider.init();
