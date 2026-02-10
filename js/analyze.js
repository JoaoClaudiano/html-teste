// js/analyze.js
function analyzeHTML() {
    const html = document.getElementById('htmlInput').value;
    const preview = document.getElementById('previewFrame');
    const resultsContainer = document.getElementById('resultsContainer');
    
    // Atualizar preview usando sandbox e srcdoc para segurança
    if (html.trim()) {
        preview.srcdoc = html;
    } else {
        preview.srcdoc = '<div style="padding:20px;color:#666;">Nenhum código para visualizar</div>';
    }
    
    // Análise usando DOMParser
    const analysis = performAnalysis(html);
    displayResults(analysis);
    
    // Salvar no histórico
    saveToHistory(html, analysis.score);
}

function performAnalysis(html) {
    let score = 100;
    const issues = [];
    const errors = [];
    const warnings = [];
    
    // Parse HTML usando DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 1. DOCTYPE (check via string since DOMParser adds it automatically)
    if (!html.trim().toLowerCase().startsWith('<!doctype')) {
        score -= 15;
        errors.push({
            type: 'error',
            title: 'DOCTYPE Ausente',
            message: 'Adicione <!DOCTYPE html> no início do documento',
            icon: '❌'
        });
    }
    
    // 2. Title tag
    const titleElement = doc.querySelector('title');
    if (!titleElement || !titleElement.textContent.trim()) {
        score -= 12;
        errors.push({
            type: 'error',
            title: 'Título ausente',
            message: 'Adicione <title>Sua Página</title> no <head>',
            icon: '❌'
        });
    } else if (titleElement.textContent.trim().length < 5) {
        score -= 5;
        warnings.push({
            type: 'warning',
            title: 'Título muito curto',
            message: 'O título deve ter pelo menos 5 caracteres para ser efetivo',
            icon: '⚠️'
        });
    }
    
    // 3. Meta charset
    const charsetMeta = doc.querySelector('meta[charset]');
    if (!charsetMeta) {
        score -= 10;
        errors.push({
            type: 'error',
            title: 'Charset não definido',
            message: 'Adicione <meta charset="UTF-8"> no <head>',
            icon: '❌'
        });
    }
    
    // 4. Meta viewport
    const viewportMeta = doc.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
        score -= 8;
        warnings.push({
            type: 'warning',
            title: 'Viewport ausente',
            message: 'Adicione <meta name="viewport" content="width=device-width, initial-scale=1.0"> para responsividade',
            icon: '⚠️'
        });
    }
    
    // 5. Imagens sem ALT
    const images = doc.querySelectorAll('img');
    images.forEach((img, imgIndex) => {
        if (!img.hasAttribute('alt')) {
            score -= 6;
            errors.push({
                type: 'error',
                title: `Imagem ${imgIndex + 1} sem atributo ALT`,
                message: 'Todas as imagens devem ter atributo alt para acessibilidade',
                icon: '❌'
            });
        }
    });
    
    // 6. H1 count (deve ter exatamente 1)
    const h1Elements = doc.querySelectorAll('h1');
    if (h1Elements.length === 0) {
        score -= 10;
        warnings.push({
            type: 'warning',
            title: 'Nenhum H1 encontrado',
            message: 'Sua página deve ter exatamente um <h1> como título principal',
            icon: '⚠️'
        });
    } else if (h1Elements.length > 1) {
        score -= 8;
        warnings.push({
            type: 'warning',
            title: `${h1Elements.length} H1 encontrados`,
            message: 'Use apenas um <h1> por página. Use <h2> para subtítulos',
            icon: '⚠️'
        });
    }
    
    // 7. Hierarquia de headings (h1 → h2 → h3)
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let lastLevel = 0;
    let hierarchyBroken = false;
    
    headings.forEach(heading => {
        const level = parseInt(heading.tagName.substring(1));
        if (lastLevel > 0 && level > lastLevel + 1) {
            hierarchyBroken = true;
        }
        lastLevel = level;
    });
    
    if (hierarchyBroken) {
        score -= 8;
        warnings.push({
            type: 'warning',
            title: 'Hierarquia de headings incorreta',
            message: 'Não pule níveis de heading (ex: h1 → h3). Use h1 → h2 → h3 sequencialmente',
            icon: '⚠️'
        });
    }
    
    // 8. Meta description (SEO)
    const descriptionMeta = doc.querySelector('meta[name="description"]');
    if (!descriptionMeta) {
        score -= 6;
        warnings.push({
            type: 'warning',
            title: 'Meta description ausente',
            message: 'Adicione <meta name="description" content="..."> para melhorar SEO',
            icon: '⚠️'
        });
    }
    
    // 9. Lang attribute
    const htmlElement = doc.querySelector('html');
    if (!htmlElement || !htmlElement.hasAttribute('lang')) {
        score -= 5;
        warnings.push({
            type: 'warning',
            title: 'Atributo lang ausente',
            message: 'Adicione lang="pt-BR" na tag <html> para acessibilidade',
            icon: '⚠️'
        });
    }
    
    // 10. Tags semânticas
    const semanticTags = doc.querySelectorAll('header, nav, main, article, section, aside, footer');
    const divs = doc.querySelectorAll('div');
    if (semanticTags.length === 0 && divs.length > 0) {
        score -= 5;
        warnings.push({
            type: 'warning',
            title: 'Poucas tags semânticas',
            message: 'Use tags semânticas (header, nav, main, footer) em vez de apenas divs',
            icon: '⚠️'
        });
    }
    
    // Consolidar issues
    issues.push(...errors, ...warnings);
    
    // Garantir score entre 0 e 100
    score = Math.max(0, Math.min(100, score));
    
    return { 
        score, 
        issues,
        errorCount: errors.length,
        warningCount: warnings.length
    };
}

function displayResults(analysis) {
    const container = document.getElementById('resultsContainer');
    const { score, issues, errorCount, warningCount } = analysis;
    
    // Cabeçalho com estatísticas
    let html = `
        <div class="result-summary ${score >= 90 ? 'success' : score >= 70 ? 'warning' : 'error'}">
            <div class="score-display">
                <div class="score-circle">
                    <span class="score-value">${score}</span>
                    <span class="score-max">/100</span>
                </div>
                <div class="score-info">
                    <h3>${score >= 90 ? '✅ Excelente!' : score >= 70 ? '⚠️ Bom' : '❌ Precisa melhorar'}</h3>
                    <div class="issue-counts">
                        ${errorCount > 0 ? `<span class="error-count">❌ ${errorCount} ${errorCount === 1 ? 'erro' : 'erros'}</span>` : ''}
                        ${warningCount > 0 ? `<span class="warning-count">⚠️ ${warningCount} ${warningCount === 1 ? 'aviso' : 'avisos'}</span>` : ''}
                        ${errorCount === 0 && warningCount === 0 ? '<span class="ok-count">✅ Nenhum problema encontrado</span>' : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Lista de problemas
    if (issues.length === 0) {
        html += `
            <div class="result-item success">
                <span class="result-icon">✅</span>
                <div class="result-content">
                    <h3>HTML Excelente!</h3>
                    <p>Seu código está bem estruturado e segue as melhores práticas de desenvolvimento web.</p>
                </div>
            </div>
        `;
    } else {
        issues.forEach(issue => {
            html += `
                <div class="result-item ${issue.type}">
                    <span class="result-icon">${issue.icon}</span>
                    <div class="result-content">
                        <h3>${issue.title}</h3>
                        <p>${issue.message}</p>
                    </div>
                </div>
            `;
        });
    }
    
    container.innerHTML = html;
}

function saveToHistory(html, score) {
    const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
    history.unshift({
        html: html.substring(0, 100) + '...',
        score,
        date: new Date().toISOString()
    });
    
    // Manter apenas últimos 10
    if (history.length > 10) history.pop();
    
    localStorage.setItem('analysisHistory', JSON.stringify(history));
}

// Funções auxiliares
function clearEditor() {
    document.getElementById('htmlInput').value = '';
    document.getElementById('previewFrame').srcdoc = '';
    document.getElementById('resultsContainer').innerHTML = `
        <div class="result-placeholder">
            <p>Execute a análise para ver os resultados aqui</p>
        </div>
    `;
    localStorage.removeItem('htmlCode');
}

function openFullscreen() {
    const html = document.getElementById('htmlInput').value;
    if (!html.trim()) {
        alert('Cole algum código HTML primeiro');
        return;
    }
    
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Preview - Testador HTML</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { margin: 0; padding: 20px; }
                img { max-width: 100%; }
            </style>
        </head>
        <body>
            ${html}
        </body>
        </html>
    `);
    newWindow.document.close();
}

// Novas funções de verificação
function checkDoctype(html) {
    return html.includes('<!DOCTYPE html>');
}

function checkViewport(html) {
    const viewportRegex = /<meta[^>]*name=["']viewport["'][^>]*>/i;
    return viewportRegex.test(html);
}

function checkHeadingHierarchy(html) {
    const headings = html.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi) || [];
    let lastLevel = 0;
    let hasError = false;
    
    headings.forEach(heading => {
        const level = parseInt(heading.match(/<h([1-6])/i)[1]);
        if (level > lastLevel + 1) hasError = true;
        lastLevel = level;
    });
    
    return !hasError;
}

function checkMultipleH1(html) {
    const h1Count = (html.match(/<h1[^>]*>.*?<\/h1>/gi) || []).length;
    return h1Count <= 1;
}

function checkEmptyLinks(html) {
    const linkRegex = /<a\b[^>]*>(.*?)<\/a>/gi;
    let match;
    let emptyLinks = 0;
    
    while ((match = linkRegex.exec(html)) !== null) {
        const content = match[1].replace(/<[^>]*>/g, '').trim();
        const hasAriaLabel = match[0].includes('aria-label=');
        if (content === '' && !hasAriaLabel) emptyLinks++;
    }
    
    return emptyLinks === 0;
}

function checkFormLabels(html) {
    const inputRegex = /<input[^>]*>/gi;
    const textareaRegex = /<textarea[^>]*>/gi;
    const selectRegex = /<select[^>]*>/gi;
    
    const inputs = html.match(inputRegex) || [];
    const textareas = html.match(textareaRegex) || [];
    const selects = html.match(selectRegex) || [];
    
    const allFields = [...inputs, ...textareas, ...selects];
    let unlabeledFields = 0;
    
    allFields.forEach(field => {
        const hasId = field.includes('id="');
        const hasAriaLabel = field.includes('aria-label="');
        const hasLabel = html.includes(`for="${field.match(/id="([^"]*)"/)?.[1] || ''}"`);
        
        if (!hasAriaLabel && !hasLabel) unlabeledFields++;
    });
    
    return unlabeledFields === 0;
}