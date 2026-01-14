function analyzeHTML() {
  const html = document.getElementById("htmlInput").value;
  let score = 100;
  const results = [];
  const iframe = document.getElementById("previewFrame");
  iframe.srcdoc = html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Idioma
  if (!doc.documentElement.lang) {
    score -= 10;
    results.push(error("Idioma não definido", 'Adicione lang="pt-BR" na tag <html>'));
  }

  // Head
  if (!doc.querySelector("head")) {
    score -= 15;
    results.push(error("Sem <head>", "O documento não possui <head>"));
  }

  // Body
  if (!doc.querySelector("body")) {
    score -= 15;
    results.push(error("Sem <body>", "O documento não possui <body>"));
  }

  // Imagens sem ALT
  const imgs = doc.querySelectorAll("img");
  let imgPenalty = 0;
  imgs.forEach(img => {
    if (!img.hasAttribute("alt")) {
      imgPenalty += 5;
      results.push(warn("Imagem sem ALT", "Imagens devem conter atributo alt"));
    }
  });
  score -= Math.min(imgPenalty, 20);

  // Excesso de DIV
  const divs = doc.querySelectorAll("div").length;
  if (divs > 20) {
    score -= 10;
    results.push(warn("Excesso de DIVs", "Considere usar tags semânticas"));
  }

  // Tags obsoletas
  const obsolete = doc.querySelectorAll("font, center, marquee");
  if (obsolete.length > 0) {
    score -= 10;
    results.push(warn("Tags obsoletas", "Evite usar <font>, <center>, <marquee>"));
  }

  score = Math.max(score, 0);
  renderResults(results, score);
}

function renderResults(items, score) {
  const container = document.getElementById("results");
  container.innerHTML = "";
  container.appendChild(scoreCard(score));

  if (items.length === 0) {
    container.appendChild(card("Código limpo", "Nenhum problema encontrado", "ok"));
    return;
  }
  items.forEach(item => container.appendChild(item));
}

function scoreCard(score) {
  let type = "ok";
  let label = "Excelente";
  if (score < 90) label = "Bom";
  if (score < 70) { label = "Regular"; type = "warn"; }
  if (score < 50) { label = "Ruim"; type = "error"; }

  const div = document.createElement("div");
  div.className = `card ${type}`;
  div.innerHTML = `<h3>Qualidade do HTML</h3><p><strong>${score}/100</strong> — ${label}</p>`;
  return div;
}

function card(title, msg, type) {
  const div = document.createElement("div");
  div.className = `card ${type}`;
  div.innerHTML = `<h3>${title}</h3><p>${msg}</p>`;
  return div;
}

function error(title, msg) { return card(title, msg, "error"); }
function warn(title, msg) { return card(title, msg, "warn"); }

// Dark mode
const toggle = document.getElementById("darkToggle");
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  toggle.textContent = "☀️ Modo claro";
}
toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    toggle.textContent = "☀️ Modo claro";
  } else {
    localStorage.setItem("theme", "light");
    toggle.textContent = "🌙 Modo escuro";
  }
});
// Layout toggle
const toggleLayoutBtn = document.getElementById("toggleLayout");
const splitContainer = document.querySelector(".split");
toggleLayoutBtn.addEventListener("click", () => splitContainer.classList.toggle("stack"));

// Preview tela cheia
function openPreview() {
  const htmlCode = document.getElementById("htmlInput").value;
  if (!htmlCode.trim()) {
    alert("Cole algum código HTML antes de visualizar.");
    return;
  }
  const previewWindow = window.open("", "_blank");
  if (!previewWindow) {
    alert("O navegador bloqueou a nova aba. Permita pop-ups para este site.");
    return;
  }
  previewWindow.document.open();
  previewWindow.document.write(htmlCode);
  previewWindow.document.close();
}

function clearEditor() {
  const textarea = document.getElementById("htmlInput");
  const iframe = document.getElementById("previewFrame");
  const results = document.getElementById("results");

  textarea.value = "";        // Limpa o código
  iframe.srcdoc = "";         // Limpa a visualização
  results.innerHTML = "";     // Limpa os resultados
}

// Salvar HTML no localStorage
const htmlInput = document.getElementById("htmlInput");
if (localStorage.getItem("htmlCode")) {
  htmlInput.value = localStorage.getItem("htmlCode");
  analyzeHTML();
}
htmlInput.addEventListener("input", () => {
  localStorage.setItem("htmlCode", htmlInput.value);
});
