// js/analyze.js - VERSÃO COMPLETA E CORRIGIDA

function analyzeHTML() {
    const htmlInput = document.getElementById('htmlInput').value;
    const previewFrame = document.getElementById('previewFrame');
    const resultsDiv = document.getElementById('results');
    
    // Clear previous results
    resultsDiv.innerHTML = '';
    
    // Update preview iframe
    if (htmlInput.trim()) {
        previewFrame.srcdoc = htmlInput;
    } else {
        previewFrame.srcdoc = '<p style="padding:20px;color:#666;">Digite HTML para visualizar</p>';
    }
    
    // Run all checks
    const checks = [
        checkDoctype,
        checkHtmlLang,
        checkHead,
        checkTitle,
        checkMetaDescription,
        checkMetaViewport,
        checkImagesAlt,
        checkSemanticTags,
        checkObsoleteTags,
        checkExternalLinks,
        checkAriaLabels
    ];
    
    let score = 100;
    const results = [];
    
    checks.forEach(check => {
        const result = check(htmlInput);
        if (result) {
            score -= result.penalty || 0;
            results.push(result);
        }
    });
    
    // Ensure score is not negative
    score = Math.max(0, Math.min(100, score));
    
    // Display results
    displayResults(results, score);
}

// Individual check functions
function checkDoctype(html) {
    if (!html.includes('<!DOCTYPE')) {
        return {
            type: 'error',
            title: 'DOCTYPE ausente',
            message: 'Adicione <!DOCTYPE html> no início do documento',
            penalty: 15
        };
    }
    return null;
}

function checkHtmlLang(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    if (!doc.documentElement.hasAttribute('lang')) {
        return {
            type: 'error',
            title: 'Idioma não definido',
            message: 'Adicione lang="pt-BR" ou outro idioma na tag <html>',
            penalty: 10
        };
    }
    return null;
}

function checkHead(html) {
    if (!html.includes('<head>')) {
        return {
            type: 'error',
            title: 'Tag HEAD ausente',
            message: 'O documento deve conter a tag <head>',
            penalty: 15
        };
    }
    return null;
}

function checkTitle(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const title = doc.querySelector('title');
    
    if (!title || !title.textContent.trim()) {
        return {
            type: 'error',
            title: 'Título ausente',
            message: 'Adicione <title>Título da Página</title> dentro do <head>',
            penalty: 12
        };
    }
    return null;
}

function checkMetaDescription(html) {
    if (!html.includes('name="description"')) {
        return {
            type: 'warn',
            title: 'Meta description ausente',
            message: 'Adicione: <meta name="description" content="Descrição da página">',
            penalty: 8
        };
    }
    return null;
}

function checkMetaViewport(html) {
    if (!html.includes('name="viewport"')) {
        return {
            type: 'warn',
            title: 'Viewport não configurado',
            message: 'Adicione: <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            penalty: 8
        };
    }
    return null;
}

function checkImagesAlt(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const images = doc.querySelectorAll('img');
    const imagesWithoutAlt = [];
    
    images.forEach(img => {
        if (!img.hasAttribute('alt')) {
            imagesWithoutAlt.push(img.src || 'imagem sem src');
        }
    });
    
    if (imagesWithoutAlt.length > 0) {
        const penalty = Math.min(imagesWithoutAlt.length * 3, 20);
        return {
            type: 'error',
            title: `Imagens sem ALT (${imagesWithoutAlt.length})`,
            message: 'Adicione atributo alt descritivo às imagens: ' + imagesWithoutAlt.join(', '),
            penalty: penalty
        };
    }
    return null;
}

function checkSemanticTags(html) {
    const semanticTags = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer', 'figure', 'figcaption'];
    const foundTags = [];
    
    semanticTags.forEach(tag => {
        if (html.includes(`<${tag}`)) {
            foundTags.push(tag);
        }
    });
    
    if (foundTags.length === 0) {
        return {
            type: 'warn',
            title: 'Poucas tags semânticas',
            message: 'Considere usar tags semânticas como <header>, <nav>, <main>, <section>, etc.',
            penalty: 5
        };
    }
    return null;
}

function checkObsoleteTags(html) {
    const obsoleteTags = ['<font', '<center', '<marquee', '<blink', '<applet', '<basefont', '<big', '<dir', '<isindex'];
    const foundTags = [];
    
    obsoleteTags.forEach(tag => {
        if (html.includes(tag)) {
            foundTags.push(tag.replace('<', ''));
        }
    });
    
    if (foundTags.length > 0) {
        return {
            type: 'error',
            title: 'Tags obsoletas encontradas',
            message: 'Evite usar tags obsoletas: ' + foundTags.join(', '),
            penalty: 10
        };
    }
    return null;
}

function checkExternalLinks(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const externalLinks = doc.querySelectorAll('a[target="_blank"]');
    const unsafeLinks = [];
    
    externalLinks.forEach(link => {
        if (!link.getAttribute('rel') || !link.getAttribute('rel').includes('noopener')) {
            unsafeLinks.push(link.href || link.textContent);
        }
    });
    
    if (unsafeLinks.length > 0) {
        return {
            type: 'warn',
            title: 'Links externos inseguros',
            message: 'Adicione rel="noopener noreferrer" em links com target="_blank"',
            penalty: 5
        };
    }
    return null;
}

function checkAriaLabels(html) {
    const interactiveElements = ['button', 'a[href]', 'input', 'select', 'textarea'];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    let missingLabels = 0;
    
    interactiveElements.forEach(selector => {
        const elements = doc.querySelectorAll(selector);
        elements.forEach(el => {
            if (!el.hasAttribute('aria-label') && 
                !el.getAttribute('aria-labelledby') &&
                !el.textContent.trim() &&
                !el.getAttribute('title')) {
                missingLabels++;
            }
        });
    });
    
    if (missingLabels > 0) {
        return {
            type: 'warn',
            title: 'Elementos interativos sem rótulo',
            message: `${missingLabels} elementos precisam de aria-label ou texto visível`,
            penalty: Math.min(missingLabels * 2, 10)
        };
    }
    return null;
}

function displayResults(results, score) {
    const container = document.getElementById('results');
    
    // Create score card
    const scoreCard = document.createElement('div');
    scoreCard.className = 'card';
    
    let scoreClass = 'ok';
    let scoreText = 'Excelente';
    
    if (score < 70) {
        scoreClass = 'warn';
        scoreText = 'Regular';
    }
    if (score < 50) {
        scoreClass = 'error';
        scoreText = 'Precisa melhorar';
    }
    
    scoreCard.classList.add(scoreClass);
    scoreCard.innerHTML = `
        <h3>Pontuação: ${score}/100</h3>
        <p><strong>${scoreText}</strong></p>
        <p>${results.length} ${results.length === 1 ? 'problema encontrado' : 'problemas encontrados'}</p>
    `;
    
    container.appendChild(scoreCard);
    
    // Display each result
    results.forEach(result => {
        const resultCard = document.createElement('div');
        resultCard.className = `card ${result.type}`;
        resultCard.innerHTML = `
            <h3>${result.title}</h3>
            <p>${result.message}</p>
            <small>Penalidade: -${result.penalty} pontos</small>
        `;
        container.appendChild(resultCard);
    });
    
    if (results.length === 0) {
        const successCard = document.createElement('div');
        successCard.className = 'card ok';
        successCard.innerHTML = `
            <h3>✅ HTML válido!</h3>
            <p>Nenhum problema encontrado. Seu código está bem estruturado.</p>
        `;
        container.appendChild(successCard);
    }
}

// Dark mode and other utilities (keep your existing code)
// ... seu código existente para dark mode, clearEditor, openPreview, etc.

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load saved HTML
    const savedHTML = localStorage.getItem('htmlCode');
    if (savedHTML) {
        document.getElementById('htmlInput').value = savedHTML;
    }
    
    // Auto-save
    const htmlInput = document.getElementById('htmlInput');
    if (htmlInput) {
        htmlInput.addEventListener('input', function() {
            localStorage.setItem('htmlCode', this.value);
        });
    }
});