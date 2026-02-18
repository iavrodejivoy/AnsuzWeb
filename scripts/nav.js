(function () {
  const raw = localStorage.getItem("ansuz_session");
  const el = document.getElementById("navAccount");
  if (!el) return;

  if (raw) {
    try {
      const user = JSON.parse(raw);
      if (user && user.username) {
        el.textContent = user.username;
        el.href = "account.html";
      }
    } catch (e) {
    }
  }
})();
