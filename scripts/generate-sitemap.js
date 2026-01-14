const fs = require("fs");

const baseUrl = "https://joaoclaudiano.github.io/html-teste/";

const pages = [];
// Home
pages.push(`${baseUrl}/`);

// Páginas de erro
if (fs.existsSync("erros")) {
  fs.readdirSync("erros").forEach(file => {
    if (file.endsWith(".html")) {
      pages.push(`${baseUrl}/erros/${file.replace(".html", "")}`);
    }
  });
}

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

pages.forEach(url => {
  sitemap += `
  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
});

sitemap += `\n</urlset>`;

fs.writeFileSync("sitemap.xml", sitemap);

console.log("sitemap.xml criado com sucesso!");
