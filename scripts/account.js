/* account.js — логика страницы аккаунта */

function updatePremiumIcon(isPremium) {
  const icon = document.getElementById("premiumIcon");
  if (icon) icon.src = isPremium ? "icons/premiumY.svg" : "icons/premiumN.svg";
}

(function () {
  const user = authProvider.currentUser();

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const initials = ((user.firstName || user.username)[0] || "?").toUpperCase();
  document.getElementById("accountAvatar").textContent = initials;
  document.getElementById("accountUsername").textContent = "@" + user.username;
  document.getElementById("accountEmail").textContent = user.email;
  document.getElementById("accountFirstName").textContent =
    user.firstName || "—";
  document.getElementById("accountLastName").textContent = user.lastName || "—";
  document.getElementById("accountEmailFull").textContent = user.email;

  const navAccount = document.getElementById("navAccount");
  if (navAccount) navAccount.textContent = user.username;

  // Устанавливаем иконку и стиль никнейма при загрузке
  const isPremiumActive =
    user.isPremium &&
    (!user.premiumUntil || new Date(user.premiumUntil) > new Date());
  updatePremiumIcon(isPremiumActive);
  if (isPremiumActive) {
    document
      .getElementById("accountUsername")
      .classList.add("premium-username");
  }
})();

// Выход

function handleLogout() {
  document.getElementById("logoutModal").style.display = "flex";
}

function confirmLogout() {
  authProvider.logout();
  window.location.href = "login.html";
}

function closeLogoutModal() {
  document.getElementById("logoutModal").style.display = "none";
}

// Редактирование

function openEditModal() {
  const user = authProvider.currentUser();
  if (!user) return;

  document.getElementById("editUsername").value = user.username || "";
  document.getElementById("editFirstName").value = user.firstName || "";
  document.getElementById("editLastName").value = user.lastName || "";
  document.getElementById("editEmail").value = user.email || "";

  const msgEl = document.getElementById("editMessage");
  msgEl.style.display = "none";
  msgEl.textContent = "";

  document.getElementById("editModal").style.display = "flex";
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
}

document
  .getElementById("editForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const msgEl = document.getElementById("editMessage");
    const newUsername = document.getElementById("editUsername").value.trim();
    const newFirstName = document.getElementById("editFirstName").value.trim();
    const newLastName = document.getElementById("editLastName").value.trim();
    const newEmail = document.getElementById("editEmail").value.trim();

    if (!newUsername || !newEmail) {
      msgEl.textContent = "Имя пользователя и email обязательны.";
      msgEl.className = "auth-message auth-message--error";
      msgEl.style.display = "block";
      return;
    }

    const result = await authProvider.updateProfile({
      username: newUsername,
      email: newEmail,
      firstName: newFirstName,
      lastName: newLastName,
    });

    if (!result.ok) {
      msgEl.textContent = result.error;
      msgEl.className = "auth-message auth-message--error";
      msgEl.style.display = "block";
      return;
    }

    const u = result.user;
    const initials = ((u.firstName || u.username)[0] || "?").toUpperCase();
    document.getElementById("accountAvatar").textContent = initials;
    document.getElementById("accountUsername").textContent = "@" + u.username;
    document.getElementById("accountEmail").textContent = u.email;
    document.getElementById("accountFirstName").textContent =
      u.firstName || "—";
    document.getElementById("accountLastName").textContent = u.lastName || "—";
    document.getElementById("accountEmailFull").textContent = u.email;
    document.getElementById("navAccount").textContent = u.username;

    msgEl.textContent = "Изменения сохранены!";
    msgEl.className = "auth-message auth-message--success";
    msgEl.style.display = "block";
  });

// Мои проекты

function handleProjectsStub() {
  document.getElementById("projectsModal").style.display = "flex";
}

function closeProjectsModal() {
  document.getElementById("projectsModal").style.display = "none";
}

// Премка

function openPremiumModal() {
  const user = authProvider.currentUser();
  const isPremiumActive =
    user &&
    user.isPremium &&
    (!user.premiumUntil || new Date(user.premiumUntil) > new Date());

  const statusEl = document.getElementById("premiumModalStatus");
  const activateBtn = document.getElementById("premiumActivateBtn");

  if (isPremiumActive) {
    const until = new Date(user.premiumUntil);
    const formatted = until.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    statusEl.textContent = "Premium активен до " + formatted;
    statusEl.style.display = "block";
    statusEl.style.color = "#962ea8";
    activateBtn.textContent = "Продлить";
  } else {
    statusEl.style.display = "none";
    activateBtn.textContent = "Подключить";
    activateBtn.disabled = false;
  }

  document.getElementById("premiumModal").style.display = "flex";
}

function closePremiumModal() {
  document.getElementById("premiumModal").style.display = "none";
}

async function handleActivatePremium() {
  const activateBtn = document.getElementById("premiumActivateBtn");
  const statusEl = document.getElementById("premiumModalStatus");

  activateBtn.disabled = true;
  activateBtn.textContent = "Подключение...";

  const result = await authProvider.activatePremium();

  if (!result.ok) {
    statusEl.textContent = result.error;
    statusEl.style.display = "block";
    statusEl.style.color = "#cf6679";
    activateBtn.disabled = false;
    activateBtn.textContent = "Подключить";
    return;
  }

  const u = result.user;
  updatePremiumIcon(true);
  document.getElementById("accountUsername").classList.add("premium-username");

  const until = new Date(u.premiumUntil);
  const formatted = until.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  statusEl.textContent = "Premium активирован до " + formatted;
  statusEl.style.display = "block";
  statusEl.style.color = "#4caf50";
  activateBtn.textContent = "Готово";
  activateBtn.onclick = closePremiumModal;
}

// Закрытие модалок

window.addEventListener("click", function (e) {
  if (e.target === document.getElementById("editModal")) closeEditModal();
  if (e.target === document.getElementById("logoutModal")) closeLogoutModal();
  if (e.target === document.getElementById("projectsModal"))
    closeProjectsModal();
  if (e.target === document.getElementById("premiumModal")) closePremiumModal();
});
