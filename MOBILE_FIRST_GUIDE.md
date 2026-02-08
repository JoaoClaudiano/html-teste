# 🚀 Mobile-First Code Playground - Guia de Implementação

## 📱 Visão Geral

Este projeto implementa um playground de código **mobile-first** com integração de IA via **Hugging Face** (custo zero), **CodeMirror 6**, e recursos avançados de preview responsivo.

---

## ✨ Recursos Implementados

### 1. 🎨 Interface Mobile-First Adaptável

#### Mobile (< 768px)
- ✅ **Bottom Navigation**: Navegação entre Editor e Preview
- ✅ **Header Compacto**: 56px de altura
- ✅ **Fullscreen Views**: Editor e preview ocupam toda a tela
- ✅ **Carousel de Devices**: Navegação horizontal entre dispositivos
- ✅ **Touch-Optimized**: Áreas de toque adequadas (44px mínimo)
- ✅ **Sidebar Slide-in**: IA sidebar desliza da direita

#### Desktop (≥ 768px)
- ✅ **Layout Grid**: Editor | Preview lado a lado
- ✅ **3 Previews Simultâneos**: Mobile, Tablet, Desktop em grid
- ✅ **Bottom Nav Hidden**: Navegação ocultada no desktop
- ✅ **Sidebar Lateral**: IA sidebar com 400px de largura

#### Breakpoints
```css
- Mobile: 0-767px
- Desktop: 768px-1199px
- Large Desktop: 1200px+
```

### 2. 💻 CodeMirror 6 Integration

#### Recursos
- ✅ **Syntax Highlighting**: HTML, CSS, JavaScript
- ✅ **Autocomplete**: Sugestões inteligentes
- ✅ **Dark Theme**: OneDark theme
- ✅ **Line Numbers**: Numeração de linhas
- ✅ **Code Folding**: Colapsar blocos de código
- ✅ **Auto-save**: Salva em localStorage ao digitar

#### CDN Usage
```javascript
import { EditorView, basicSetup } from "codemirror@6.0.1";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
```

### 3. 🤖 IA via Hugging Face (Custo Zero)

#### Modelos Suportados
- **Zephyr 7B** (Recomendado) - HuggingFaceH4/zephyr-7b-beta
- **Mistral 7B** - mistralai/Mistral-7B-Instruct-v0.2
- **Llama 2 7B** - meta-llama/Llama-2-7b-chat-hf

#### Funcionalidades
1. **Chat com IA**: Perguntas sobre código
2. **Auto-fix**: Análise e correção automática de erros
3. **Gerador de Snippets**: Criação de código sob demanda
4. **Explicação de Código**: Entendimento do código atual

#### API Integration
```javascript
async function callHuggingFaceAPI(prompt) {
    const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 500,
                    temperature: 0.7,
                    return_full_text: false
                }
            })
        }
    );
    return response.json();
}
```

#### Como Obter API Key (Gratuita)
1. Acesse: https://huggingface.co/settings/tokens
2. Crie um token de leitura (Read)
3. Cole no campo "Hugging Face API Key" nas configurações

### 4. 👁️ Preview Responsivo

#### 3 Dispositivos
- **Mobile**: 375px (iPhone padrão)
- **Tablet**: 768px (iPad padrão)
- **Desktop**: 100% (largura completa)

#### Comportamento
- **Mobile**: Carousel horizontal com scroll snap
- **Desktop**: Grid com 3 iframes lado a lado

### 5. 💾 Persistência Local

#### LocalStorage
```javascript
// Código salvo automaticamente
localStorage.setItem('code_html', htmlCode);
localStorage.setItem('code_css', cssCode);
localStorage.setItem('code_js', jsCode);

// Configurações
localStorage.setItem('hf_api_key', apiKey);
localStorage.setItem('ai_model', modelName);
```

### 6. 🚀 Deploy via Vercel

#### Implementação
```javascript
document.getElementById('deploy-btn').addEventListener('click', () => {
    // Abre Vercel Deploy
    window.open('https://vercel.com/new', '_blank');
});
```

**Nota**: Para deploy automático, seria necessário criar um GitHub repository primeiro.

---

## 🎯 Como Usar

### 1. Configuração Inicial

1. Abra `index-mobile-first.html`
2. Clique no ícone de configurações (⚙️)
3. Cole sua API Key da Hugging Face
4. Selecione o modelo de IA preferido
5. Clique em "Salvar"

### 2. Usando o Editor

#### Desktop
- Editor à esquerda, preview à direita
- 3 previews simultâneos (Mobile/Tablet/Desktop)
- Clique nas abas HTML/CSS/JavaScript para alternar

#### Mobile
- Use a navegação inferior (💻 Editor | 👁️ Preview)
- Deslize para ver diferentes dispositivos no preview
- Clique nas abas para alternar linguagens

### 3. Usando a IA

1. Clique no ícone de robô (🤖)
2. Digite sua pergunta no campo de texto
3. Ou clique em "Auto-fix" para análise automática
4. A IA responderá em português

#### Exemplos de Prompts
- "Como posso centralizar este div?"
- "Adicione animação de fade-in ao título"
- "Explique este código JavaScript"
- "Corrija os erros neste HTML"

### 4. Atalhos de Teclado

- **Ctrl+Enter**: Executar código

---

## 📊 Arquitetura Técnica

### Estrutura do Código

```
index-mobile-first.html
├── Styles (CSS-in-JS)
│   ├── Variables CSS (dark theme)
│   ├── Mobile-first styles
│   └── Desktop media queries
│
├── HTML Structure
│   ├── Header (compacto)
│   ├── Main Container
│   │   ├── Editor Area (CodeMirror)
│   │   └── Preview Area (3 iframes)
│   ├── AI Sidebar (slide-in)
│   ├── Bottom Navigation (mobile)
│   └── Settings Modal
│
└── JavaScript (ES6 Modules)
    ├── CodeMirror initialization
    ├── State management
    ├── Preview updates
    ├── AI integration
    └── LocalStorage persistence
```

### Performance Otimizations

1. **Debounced Preview**: 500ms delay ao digitar
2. **Lazy Loading**: CodeMirror carregado via CDN
3. **LocalStorage**: Sem requisições ao servidor
4. **CSS Variables**: Mudanças de tema eficientes
5. **Touch Optimized**: -webkit-overflow-scrolling: touch

### Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ iOS Safari 14+
- ✅ Chrome Mobile 90+

---

## 🔧 Customização

### Alterar Tema

```css
:root {
    --bg-primary: #1e1e1e;
    --bg-secondary: #252525;
    --accent: #007acc;
    /* ... */
}
```

### Adicionar Novo Modelo de IA

```html
<select class="form-input" id="ai-model">
    <option value="seu-modelo">Seu Modelo</option>
</select>
```

### Ajustar Breakpoints

```css
@media (min-width: 768px) {
    /* Desktop styles */
}
```

---

## 🐛 Troubleshooting

### CodeMirror não carrega
- **Causa**: CDN bloqueado
- **Solução**: Verifique conexão com internet ou use mirror alternativo

### API da Hugging Face retorna erro
- **Causa**: API Key inválida ou modelo indisponível
- **Solução**: 
  1. Verifique se a key está correta
  2. Teste com modelo diferente
  3. Aguarde alguns minutos (rate limit)

### Preview não atualiza
- **Causa**: Erro de JavaScript no código
- **Solução**: Abra o console do navegador (F12)

---

## 📈 Roadmap Futuro

### V2.0 (Próximas Features)
- [ ] Suporte a TypeScript
- [ ] Temas customizáveis
- [ ] Histórico de versões (IndexedDB)
- [ ] Compartilhamento via URL
- [ ] Deploy automático ao GitHub
- [ ] Colaboração em tempo real (opcional)
- [ ] Mais modelos de IA
- [ ] PWA (Progressive Web App)

---

## 📝 Licença

MIT License - Sinta-se livre para usar e modificar!

---

## 👥 Contribuindo

Sugestões e melhorias são bem-vindas! Abra uma issue ou PR no GitHub.

---

## 🙏 Créditos

- **CodeMirror**: https://codemirror.net/
- **Hugging Face**: https://huggingface.co/
- **Design**: Mobile-first approach
- **Icons**: Emoji nativo

---

**Última atualização**: Fevereiro 2026
