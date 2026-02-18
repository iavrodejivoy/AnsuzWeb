// node scripts/inject-partials.js

const fs   = require("fs");
const path = require("path");

const ROOT     = path.resolve(__dirname, "..");
const PARTIALS = path.join(ROOT, "partials");

const HTML_FILES = fs
  .readdirSync(ROOT)
  .filter((f) => f.endsWith(".html"));

const ACTIVE_MAP = {
  "index.html"   : "index",
  "about.html"   : "about",
  "app.html"     : "app",
  "download.html": "download",
  "account.html" : "account",
};

const headerTemplate = fs.readFileSync(
  path.join(PARTIALS, "header.html"),
  "utf8"
);
const footerTemplate = fs.readFileSync(
  path.join(PARTIALS, "footer.html"),
  "utf8"
);

function buildHeader(activePage) {
  let header = headerTemplate;

  if (activePage === "account") {
    header = header.replace(
      /href="login\.html"(\s+class="nav-link"\s+data-page="account")/,
      'href="account.html"$1'
    );
  }

  if (activePage) {
    header = header.replace(
      new RegExp(`(class="nav-link")(\\s+data-page="${activePage}")`),
      'class="nav-link active"$2'
    );
  }

  return header;
}

function replaceHeader(html, newHeader) {
  return html.replace(
    /<header\b[^>]*>[\s\S]*?<\/header>/,
    newHeader.trim()
  );
}

function replaceFooter(html, newFooter) {
  // Удаляем существующий футер (где бы он ни находился)
  html = html.replace(/[ \t]*<footer\b[^>]*>[\s\S]*?<\/footer>\n?/g, "");
  // Вставляем футер внутрь .container перед закрывающим </div></body>
  return html.replace(
    /(\s*<\/div>\s*<\/body>)/,
    "\n    " + newFooter.trim() + "$1"
  );
}

let updated = 0;
let skipped = 0;

for (const file of HTML_FILES) {
  const filePath   = path.join(ROOT, file);
  const original   = fs.readFileSync(filePath, "utf8");

  const activePage = ACTIVE_MAP[file] || null;
  const newHeader  = buildHeader(activePage);
  const newFooter  = footerTemplate.trim();

  let result = original;
  result = replaceHeader(result, newHeader);
  result = replaceFooter(result, newFooter);

  if (result !== original) {
    fs.writeFileSync(filePath, result, "utf8");
    console.log(`✅  Обновлён: ${file}`);
    updated++;
  } else {
    console.log(`⏭   Без изменений: ${file}`);
    skipped++;
  }
}

console.log(`\nГотово. Обновлено: ${updated}, без изменений: ${skipped}.`);
