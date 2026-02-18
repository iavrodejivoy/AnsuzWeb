const fs = require("fs");
const path = require("path");
const markdownIt = require("markdown-it");

// для обнофления файлов использовать   node scripts/generate.js

function minifyHTML(html) {
  return html.replace(/\s+/g, " ").trim();
}

function generatePage(mdFile, htmlFile, title) {
  try {
    const mdContent = fs.readFileSync(mdFile, "utf8");

    const md = new markdownIt({
      html: true,
      breaks: true,
      linkify: true,
    });
    const htmlContent = md.render(mdContent);

    const htmlTemplate = `
      <!doctype html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title} - Ansuz</title>
        <link rel="icon" type="image/png" href="icon.png" />
        <link rel="apple-touch-icon" href="icon.png" />
        <meta name="theme-color" content="#bb86fc" />
        <meta name="msapplication-TileColor" content="#bb86fc" />
        <meta name="msapplication-TileImage" content="icon.png" />
        <link rel="stylesheet" href="themes.css" />
        <link rel="stylesheet" href="styles.css" />
      </head>
      <body>
        <div class="container">
          <header class="header">
            <a href="index.html" class="header-logo">
              <img
                src="icons/ansuz.svg"
                alt="icon"
                height="32px"
                style="margin-right: 10px"
              />
              <h1>Ansuz</h1>
            </a>
            <nav>
            <a href="index.html" class="nav-link">Главная</a>
            <a href="about.html" class="nav-link">О нас</a>
            <a href="app.html" class="nav-link">О приложении</a>
            <a href="download.html" class="nav-link">Скачать</a>
            <a href="login.html" class="nav-link">Аккаунт</a>
            </nav>
          </header>
          <main class="main-content">
            <section class="about-section">
            <h2>${title}</h2>
            ${htmlContent}
            </section>
          </main>
          <footer class="footer">
            <p>&copy; 2026 Ansuz. Все права защищены. |
            <a href="terms.html">Условия использования</a> |
            <a href="privacy.html">Политика конфиденциальности</a></p>
          </footer>
        </div>
      </body>
      </html>
      `;

    const minifiedHTML = minifyHTML(htmlTemplate);
    fs.writeFileSync(htmlFile, minifiedHTML);

    console.log(`Сгенерирована страница: ${htmlFile}`);
  } catch (error) {
    console.error(`Ошибка при генерации страницы ${htmlFile}:`, error.message);
  }
}

function updateFooter() {
  const pages = [
    "index.html",
    "about.html",
    "app.html",
    "download.html",
    "login.html",
    "register.html",
  ];

  pages.forEach((page) => {
    try {
      const content = fs.readFileSync(page, "utf8");
      const newContent = content.replace(
        /<footer class="footer">\s*<p>&copy; 2026 Ansuz\. Все права защищены\.<\/p>\s*<\/footer>/g,
        `<footer class="footer">
        <p>&copy; 2026 Ansuz. Все права защищены. | 
           <a href="terms.html">Условия использования</a> | 
           <a href="privacy.html">Политика конфиденциальности</a>
        </p>
      </footer>`,
      );
      fs.writeFileSync(page, newContent);
      console.log(`Обновлен footer на странице: ${page}`);
    } catch (error) {
      console.error(
        `Ошибка при обновлении footer на странице ${page}:`,
        error.message,
      );
    }
  });
}

function generateAllPages() {
  console.log("Начало генерации страниц...");

  generatePage("md/terms.md", "terms.html", "Условия использования");
  generatePage("md/conf.md", "privacy.html", "Политика конфиденциальности");

  updateFooter();

  console.log("Генерация страниц завершена!");
}

function watchMDChanges() {
  fs.watch("md", (eventType, filename) => {
    if (filename && (filename.endsWith(".md") || filename.endsWith(".MD"))) {
      console.log(`Обнаружено изменение в файле: ${filename}`);
      generateAllPages();
    }
  });
}

if (process.argv.includes("--watch")) {
  console.log("Активирован режим отслеживания изменений...");
  watchMDChanges();
} else {
  generateAllPages();
}

module.exports = { generatePage, updateFooter };
