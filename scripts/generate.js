const fs   = require("fs");
const path = require("path");
const markdownIt = require("markdown-it");

// для обновления файлов использовать:   node scripts/generate.js
// режим слежения за md/:              node scripts/generate.js --watch

const ROOT     = path.resolve(__dirname, "..");
const PARTIALS = path.join(ROOT, "partials");

function getPartials() {
  const header = fs.readFileSync(path.join(PARTIALS, "header.html"), "utf8").trim();
  const footer = fs.readFileSync(path.join(PARTIALS, "footer.html"), "utf8").trim();
  return { header, footer };
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

    const { header, footer } = getPartials();

    const htmlTemplate = `<!doctype html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Ansuz - Приложение для заметок</title>
      <link rel="stylesheet" href="css/styles.css" />
      <link rel="icon" type="image/png" href="icons/icon.png" />
      <link rel="apple-touch-icon" href="icons/icon.png" />
      <meta name="theme-color" content="#bb86fc" />
      <meta name="msapplication-TileColor" content="#bb86fc" />
      <meta name="msapplication-TileImage" content="icons/icon.png" />
    </head>
      <body>
        <div class="container">
          ${header}
          <main class="main-content">
            <section class="about-section">
              <h1>${title}</h1>
              ${htmlContent}
            </section>
          </main>
        </div>
      </body>
      ${footer}
    </html>
    `;

    fs.writeFileSync(htmlFile, htmlTemplate);
    console.log(`Сгенерирована страница: ${htmlFile}`);
  } catch (error) {
    console.error(`Ошибка при генерации страницы ${htmlFile}:`, error.message);
  }
}

function generateAllPages() {
  console.log("Начало генерации страниц...");

  generatePage("md/terms.md", "terms.html", "Условия использования");
  generatePage("md/conf.md",  "privacy.html", "Политика конфиденциальности");

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

module.exports = { generatePage };
