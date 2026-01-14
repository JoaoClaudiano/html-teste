const fs = require("fs");
const errors = JSON.parse(fs.readFileSync("errors.json", "utf8"));
const template = fs.readFileSync("templates/error-template.html", "utf8");

if (!fs.existsSync("erros")) {
  fs.mkdirSync("erros");
}

errors.forEach(err => {
  const impactList = err.impact
    .map(item => `<li>${item}</li>`)
    .join("");

  let page = template
    .replace(/{{TITLE}}/g, err.title)
    .replace(/{{DESCRIPTION}}/g, err.description)
    .replace(/{{SLUG}}/g, err.slug)
    .replace(/{{PROBLEM}}/g, err.problem)
    .replace(/{{IMPACT_LIST}}/g, impactList)
    .replace(/{{SOLUTION}}/g, err.solution);

  fs.writeFileSync(`erros/${err.slug}.html`, page);
});

console.log("Páginas de erro geradas com sucesso.");
