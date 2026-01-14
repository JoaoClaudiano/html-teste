function analyzeHTML() {
  const html = document.getElementById("htmlInput").value.trim();
  const iframe = document.getElementById("previewFrame");

  if (!html) {
    alert("Cole algum código HTML para analisar.");
    return;
  }

  let score = 100;
  const results = [];

  /* ===== PREVIEW ===== */
  iframe.setAttribute("sandbox", "allow-same-origin");
  iframe.srcdoc = html;

  /* ===== PARSER ===== */
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  /* =====================
     REGRAS DE ANÁLISE
  ===================== */

  /* HTML / LANG */
  if (!doc.documentElement || !doc.documentElement.getAttribute("lang")) {
    score -= 10;
    results.push(
      error(
        "Idioma não definido",
        'Adicione <html lang="pt-BR"> para acessibilidade e SEO.'
      )
    );
  }

  /* HEAD */
  if (!doc.querySelector("head")) {
    score -= 15;
    results.push(
      error("Sem <head>", "O documento HTML não possui a tag <head>.")
    );
  }

  /* TITLE */
  if (!doc.querySelector("title")) {
    score -= 10;
    results.push(
      warn(
        "Title ausente",
        "A página não possui <title>, essencial para SEO."
      )
    );
  }

  /* META DESCRIPTION */
  if (!doc.querySelector('meta[name="description"]')) {
    score -= 10;
    results.push(
      warn(
        "Meta description ausente",
        "Adicione uma meta description para melhorar SEO."
      )
    );
  }

  /* BODY */
  if (!doc.querySelector("body")) {
    score -= 15;
    results.push(
      error("Sem <body>", "O documento HTML não possui a tag <body>.")
    );
  }

  /* H1 */
  if (doc.querySelectorAll("h1").length === 0) {
    score -= 5;
    results.push(
      warn(
        "Sem <h1>",
        "É recomendado ao menos um <h1> para estrutura semântica."
      )
    );
  }

  /* IMAGENS SEM ALT */
  const imgs = doc.querySelectorAll("img");
  const imgsSemAlt = Array.from(imgs).filter(img => !img.hasAttribute("alt"));

  if (imgsSemAlt.length > 0) {
    score -= Math.min(imgsSemAlt.length * 5, 20);
    results.push(
      warn(
        "Imagens sem ALT",
        `${imgsSemAlt.length} imagem(ns) sem atributo alt. Isso afeta acessibilidade.`
      )
    );
  }

  /* EXCESSO DE DIV */
  const divs = doc.querySelectorAll("div").length;
  if (divs > 20) {
    score -= 10;
    results.push(
      warn(
        "Excesso de DIVs",
        "Considere usar tags semânticas como <section>, <article>, <main>."
      )
    );
  }

  /* TAGS OBSOLETAS */
  const obsolete = doc.querySelectorAll("font, center, marquee");
  if (obsolete.length > 0) {
    score -= 10;
    results.push(
      warn(
        "Tags obsoletas",
        "Evite <font>, <center> e <marquee>. Elas estão obsoletas."
      )
    );
  }

  score = Math.max(score, 0);
  renderResults(results, score);
}

/* =====================
   RENDERIZAÇÃO
===================== */

function renderResults(items, score) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  container.appendChild(scoreCard(score));

  if (items.length === 0) {
    container.appendChild(
      card("Código limpo", "Nenhum problema encontrado.", "ok")
    );
    return;
  }

  items.forEach(item => container.appendChild(item));
}

function scoreCard(score) {
  let type = "ok";
  let label = "Excelente";

  if (score < 90) label = "Bom";
  if (score < 70) {
    label = "Regular";
    type = "warn";
  }
  if (score < 50) {
    label = "Ruim";
    type = "error";
  }

  const div = document.createElement("div");
  div.className = `card ${type}`;
  div.innerHTML = `
    <h3>Qualidade do HTML</h3>
    <p><strong>${score}/100</strong> — ${label}</p>
  `;
  return div;
}

/* =====================
   CARDS
===================== */

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

/* =====================
   PREVIEW EM NOVA ABA
===================== */

function openPreview() {
  const htmlCode = document.getElementById("htmlInput").value.trim();

  if (!htmlCode) {
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