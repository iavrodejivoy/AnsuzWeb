/**
 * mock-users.js — конфигурационный файл с фиктивными аккаунтами.
 *
 * Используется только для разработки и тестирования.
 * При переходе на реальный бэкенд (PostgreSQL) этот файл
 * можно отключить, переключив провайдер в auth.js.
 *
 * Формат объекта пользователя:
 * {
 *   username    : string  — уникальный логин
 *   email       : string  — уникальный email (используется для входа)
 *   password    : string  — пароль (plain-text, только для mock-режима!)
 *   firstName   : string  — имя
 *   lastName    : string  — фамилия
 * }
 */

const MOCK_USERS = [
  {
    username: "admin",
    email: "admin@ansuz.ru",
    password: "admin123",
    firstName: "Иван",
    lastName: "Иванов",
  },
  {
    username: "user1",
    email: "user1@ansuz.ru",
    password: "user1234",
    firstName: "Мария",
    lastName: "Петрова",
  },
  {
    username: "testuser",
    email: "test@example.com",
    password: "test1234",
    firstName: "Тест",
    lastName: "Тестов",
  },
];
