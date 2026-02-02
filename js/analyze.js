// js/analyze.js
function analyzeHTML() {
    const html = document.getElementById('htmlInput').value;
    const preview = document.getElementById('previewFrame');
    const resultsContainer = document.getElementById('resultsContainer');
    
    // Atualizar preview
    if (html.trim()) {
        preview.srcdoc = html;
    } else {
        preview.srcdoc = '<div style="padding:20px;color:#666;">Nenhum código para visualizar</div>';
    }
    
    // Análise
    const analysis = performAnalysis(html);
    displayResults(analysis);
    
    // Salvar no histórico
    saveToHistory(html, analysis.score);
}

function performAnalysis(html) {
    let score = 100;
    const issues = [];
    
    // 1. DOCTYPE
    if (!html.includes('<!DOCTYPE')) {
        score -= 15;
        issues.push({
            type: 'error',
            title: 'DOCTYPE Ausente',
            message: 'Adicione <!DOCTYPE html> no início do documento',
            fix: '<!DOCTYPE html>'
        });
    }
    
    // 2. Charset
    if (!html.includes('charset="UTF-8"') && !html.includes("charset='UTF-8'")) {
        score -= 10;
        issues.push({
            type: 'error',
            title: 'Charset não definido',
            message: 'Adicione <meta charset="UTF-8">',
            fix: '<meta charset="UTF-8">'
        });
    }
    
    // 3. Viewport
    if (!html.includes('viewport')) {
        score -= 8;
        issues.push({
            type: 'warning',
            title: 'Viewport ausente',
            message: 'Importante para mobile: <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            fix: '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
        });
    }
    
    // 4. Title
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (!titleMatch) {
        score -= 12;
        issues.push({
            type: 'error',
            title: 'Título ausente',
            message: 'Adicione <title>Sua Página</title>',
            fix: '<title>Sua Página</title>'
        });
    } else if (titleMatch[1].trim().length < 5) {
        score -= 5;
        issues.push({
            type: 'warning',
            title: 'Título muito curto',
            message: 'O título deve ter pelo menos 5 caracteres',
            fix: '<title>Título Descritivo da Página</title>'
        });
    }
    
    // 5. Meta description
    if (!html.includes('name="description"')) {
        score -= 8;
        issues.push({
            type: 'warning',
            title: 'Meta description ausente',
            message: 'Importante para SEO: <meta name="description" content="Descrição da página">',
            fix: '<meta name="description" content="Descrição da página">'
        });
    }
    
    // 6. Imagens sem ALT
    const imgRegex = /<img[^>]*>/g;
    const images = html.match(imgRegex) || [];
    images.forEach((img, index) => {
        if (!img.includes('alt=')) {
            score -= 6;
            issues.push({
                type: 'error',
                title: `Imagem ${index + 1} sem ALT`,
                message: 'Adicione atributo alt descritivo',
                fix: 'alt="descrição da imagem"'
            });
        }
    });
    
    // 7. Tags semânticas
    const semanticTags = ['<header', '<nav', '<main', '<article', '<section', '<aside', '<footer'];
    const hasSemantic = semanticTags.some(tag => html.includes(tag));
    
    if (!hasSemantic && html.includes('<div')) {
        score -= 5;
        issues.push({
            type: 'warning',
            title: 'Poucas tags semânticas',
            message: 'Use tags semânticas como header, nav, main, footer',
            fix: '<header>, <nav>, <main>, <footer>'
        });
    }
    
    // 8. Links externos sem rel
    const externalLinks = html.match(/<a[^>]*href=["'][^"']*["'][^>]*>/g) || [];
    externalLinks.forEach(link => {
        if (link.includes('http') && !link.includes('rel=')) {
            score -= 4;
            issues.push({
                type: 'warning',
                title: 'Link externo sem rel',
                message: 'Para links externos: rel="noopener noreferrer"',
                fix: 'rel="noopener noreferrer"'
            });
        }
    });
    
    // 9. Lang attribute
    if (!html.includes('lang=')) {
        score -= 5;
        issues.push({
            type: 'warning',
            title: 'Idioma não definido',
            message: 'Adicione lang="pt-BR" na tag html',
            fix: '<html lang="pt-BR">'
        });
    }
    
    // Garantir score entre 0 e 100
    score = Math.max(0, Math.min(100, score));
    
    return { score, issues };
}

function displayResults(analysis) {
    const container = document.getElementById('resultsContainer');
    const { score, issues } = analysis;
    
    let html = `
        <div class="result-item ${score >= 90 ? 'success' : score >= 70 ? 'warning' : 'error'}">
            <h3>Pontuação: ${score}/100</h3>
            <p>${issues.length} ${issues.length === 1 ? 'problema encontrado' : 'problemas encontrados'}</p>
        </div>
    `;
    
    if (issues.length === 0) {
        html += `
            <div class="result-item success">
                <h3>✅ HTML Excelente!</h3>
                <p>Seu código está bem estruturado e segue as melhores práticas.</p>
            </div>
        `;
    } else {
        issues.forEach(issue => {
            html += `
                <div class="result-item ${issue.type}">
                    <h3>${issue.title}</h3>
                    <p>${issue.message}</p>
                    <p><strong>Solução:</strong> ${issue.fix}</p>
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