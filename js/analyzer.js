function analyzeHTML() {
  const html = document.getElementById("htmlInput").value;
  const results = [];

  // Renderização
  const iframe = document.getElementById("previewFrame");
  iframe.srcdoc = html;

  // Parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Regras
  if (!doc.documentElement.lang) {
    results.push(error("Idioma não definido", "Adicione lang=\"pt-BR\" na tag <html>"));
  }

  if (!doc.querySelector("head")) {
    results.push(error("Sem <head>", "O documento não possui <head>"));
  }

  if (!doc.querySelector("body")) {
    results.push(error("Sem <body>", "O documento não possui <body>"));
  }

  const imgs = doc.querySelectorAll("img");
  imgs.forEach(img => {
    if (!img.hasAttribute("alt")) {
      results.push(warn("Imagem sem ALT", "Imagens devem conter atributo alt"));
    }
  });

  const divs = doc.querySelectorAll("div").length;
  if (divs > 20) {
    results.push(warn("Excesso de DIVs", "Considere usar tags semânticas"));
  }

  renderResults(results);
}

function renderResults(items) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = card("Código limpo", "Nenhum problema encontrado", "ok");
    return;
  }

  items.forEach(item => container.appendChild(item));
}

function card(title, msg, type) {
  const div = document.createElement("div");
  div.className = `card ${type}`;
  div.innerHTML = `<h3>${title}</h3><p>${msg}</p>`;
  return div;
}

function error(title, msg) {
  return card(title, msg, "error");
}

function warn(title, msg) {
  return card(title, msg, "warn");
}