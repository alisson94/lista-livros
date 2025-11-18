const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Lista para armazenar livros encontrados
let scrapedBooks = [];

// Função para fazer scraping na Amazon
async function scrapeAmazonBooks(searchTerm) {
  let browser;
  try {
    console.log(`🔍 Iniciando busca por: ${searchTerm}`);
    
    browser = await puppeteer.launch({
      headless: true, // Para ver o navegador em ação
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--no-first-run',
        '--disable-extensions'
      ]
    });
    
    const page = await browser.newPage();
    
    // Configurações mais robustas para evitar detecção
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1366, height: 768 });
    
    // Remover propriedades que indicam automação
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });
    
    // Navegar para Amazon
    const searchUrl = `https://www.amazon.com.br/s?k=${encodeURIComponent(searchTerm)}&i=stripbooks&ref=nb_sb_noss`;
    console.log(`📖 Navegando para: ${searchUrl}`);
    
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Debug: tirar screenshot para ver o que está acontecendo
    await page.screenshot({ path: 'debug_amazon.png', fullPage: true });
    console.log('📸 Screenshot salva como debug_amazon.png');
    
    // 🔍 PONTO DE PARADA PARA INSPEÇÃO MANUAL
    // console.log('🛑 PÁGINA CARREGADA! Inspecione a Amazon no navegador que abriu.');
    // console.log('🔍 Quando terminar a inspeção, pressione ENTER para continuar...');
    
    // // Aguardar input do usuário
    // await new Promise((resolve) => {
    //   const readline = require('readline');
    //   const rl = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout
    //   });
      
    //   rl.question('Pressione ENTER para continuar o scraping: ', () => {
    //     rl.close();
    //     resolve();
    //   });
    // });
    
    // console.log('▶️ Continuando com o scraping...');
    
    // Tentar diferentes seletores para os resultados
    let bookElements;

    try {
      await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 5000 });
      bookElements = '[data-component-type="s-search-result"]';
      console.log('✅ Encontrado seletor: [data-component-type="s-search-result"]');
    } catch (e1) {
      try {
        await page.waitForSelector('.s-result-item', { timeout: 5000 });
        bookElements = '.s-result-item';
        console.log('✅ Encontrado seletor: .s-result-item');
      } catch (e2) {
        try {
          await page.waitForSelector('[data-cy="title-recipe-review"]', { timeout: 5000 });
          bookElements = '[data-cy="title-recipe-review"]';
          console.log('✅ Encontrado seletor: [data-cy="title-recipe-review"]');
        } catch (e3) {
          console.log('❌ Nenhum seletor de livros encontrado');
          
          // Debug: verificar se há resultados na página
          const pageText = await page.content();
          if (pageText.includes('Nenhum resultado')) {
            console.log('❌ Página retornou "Nenhum resultado"');
          }
          
          throw new Error('Não foi possível encontrar resultados de livros na página');
        }
      }
    }
    
    // Extrair dados dos livros com seletores mais flexíveis
    console.log(`🔍 Iniciando extração com seletor: ${bookElements}`);
    
    const books = await page.evaluate((selector) => {
      const elements = document.querySelectorAll(selector);
      const results = [];
      
      elements.forEach((element, index) => {
        if (index >= 15) return; // Aumentar para 15 livros
        
        try {
          // Múltiplas tentativas para título
          let title = '';
          const titleSelectors = [
            'h2 a span',
            'h2 span',
            '.s-size-mini span',
            '[data-cy="title-recipe-review"]',
            '.a-link-normal .a-text-normal',
            'a[href*="/dp/"] span'
          ];
          
          for (const sel of titleSelectors) {
            const titleEl = element.querySelector(sel);
            if (titleEl && titleEl.textContent.trim()) {
              title = titleEl.textContent.trim();
              break;
            }
          }
          
          // Múltiplas tentativas para autor (baseado na div a-row que você encontrou)
          let author = '';
          const authorSelectors = [
            '.a-section .a-row.a-size-base', // Nova tentativa com a-section
            
          ];
          
          for (const sel of authorSelectors) {
            const authorEl = element.querySelector(sel);
            if (authorEl && authorEl.textContent.trim()) {
              const authorText = authorEl.textContent.trim();
              
              // Extrair apenas o texto depois de "por"
              if (authorText.includes('por')) {
                // Método 1: Regex para capturar texto após "por"
                const regexPatterns = [
                  /por\s+([^|]+?)(?:\s*\||\s*$)/,          // "por Autor" até | ou fim
                  /\|\s*por\s+([^|]+?)(?:\s*\||\s*$)/,     // "| por Autor" 
                  /por\s+(.+?)(?:\s*\||\s*e\s|\s*$)/       // "por Autor" até "e" ou |
                ];
                
                for (const regex of regexPatterns) {
                  const match = authorText.match(regex);
                  if (match && match[1]) {
                    const extractedAuthor = match[1].trim();
                    
                    // Validar se é um autor válido
                    if (extractedAuthor.length >= 2 && 
                        extractedAuthor.length <= 80 &&
                        !extractedAuthor.includes('R$') &&
                        !extractedAuthor.includes('Edição')) {
                      
                      author = extractedAuthor;
                      break;
                    }
                  }
                }
                
                // Método 2: Split simples se regex não funcionou
                if (!author) {
                  const parts = authorText.split('por');
                  if (parts.length > 1) {
                    let afterPor = parts[1].trim();
                    
                    // Limpar até o primeiro "|" se houver
                    if (afterPor.includes('|')) {
                      afterPor = afterPor.split('|')[0].trim();
                    }
                    
                    // Remover " e " do final se houver múltiplos autores
                    afterPor = afterPor.replace(/\s+e\s*$/, '').trim();
                    
                    if (afterPor.length >= 2 && afterPor.length <= 80 && 
                        !afterPor.includes('R$')) {
                      author = afterPor;
                    }
                  }
                }
                
                break; // Para na primeira a-row que contém "por"
              }
            }
          }
          
          // Múltiplas tentativas para preço
          let price = '';
          const priceSelectors = [
            '.a-price .a-offscreen',
            '.a-price-whole',
            '.a-color-price .a-offscreen',
            '.a-price-range .a-offscreen',
            'span.a-price.a-text-price.a-size-medium.a-color-base .a-offscreen'
          ];
          
          for (const sel of priceSelectors) {
            const priceEl = element.querySelector(sel);
            if (priceEl && priceEl.textContent.trim()) {
              const priceText = priceEl.textContent.trim();
              // Validar se realmente é um preço
              if (priceText.includes('R$') || priceText.includes('$')) {
                price = priceText;
                break;
              }
            }
          }
          
          // Se não encontrou preço específico, tentar alternativas
          if (!price) {
            const fallbackPriceSelectors = [
              '.a-price',
              '[class*="price"]'
            ];
            
            for (const sel of fallbackPriceSelectors) {
              const priceEl = element.querySelector(sel);
              if (priceEl) {
                const priceText = priceEl.textContent.trim();
                if ((priceText.includes('R$') || priceText.includes('$')) && priceText.length < 50) {
                  price = priceText;
                  break;
                }
              }
            }
          }
          
          // Rating
          const ratingEl = element.querySelector('.a-icon-alt') || element.querySelector('.a-star-alt');
          const rating = ratingEl ? ratingEl.textContent.trim() : '';
          
          // Link
          const linkEl = element.querySelector('[data-cy="title-recipe"] a.a-link-normal.s-line-clamp-2') || element.querySelector('a[href*="/dp/"]');
          const link = linkEl ? 'https://www.amazon.com.br' + linkEl.getAttribute('href') : '';
          
          // Imagem
          const imgEl = element.querySelector('.s-image') || element.querySelector('img');
          const image = imgEl ? imgEl.getAttribute('src') : '';
          
          if (title && title.length > 3) {
            results.push({
              id: Date.now() + index,
              title,
              author: author || 'Autor não encontrado',
              price: price || 'Preço não disponível',
              rating: rating || 'Sem avaliação',
              link,
              image,
              source: 'Amazon',
              scrapedAt: new Date().toISOString()
            });
          }
        } catch (error) {
          // Erro silencioso no navegador
        }
      });
      
      return results;
      return results;
    }, bookElements);
    
    console.log(`✅ Retornaram ${books.length} livros do navegador`);
    
    // Log detalhado dos livros encontrados no servidor
    if (books.length > 0) {
      console.log('📚 Livros extraídos:');
      books.forEach((book, index) => {
        console.log(`  ${index + 1}. "${book.title}" - ${book.author} - ${book.price}`);
      });
    } else {
      console.log('❌ Nenhum livro foi extraído. Verificando problemas...');
    }
    return books;
    
  } catch (error) {
    console.error('❌ Erro durante o scraping:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Rotas da API

// Rota principal
app.get('/', (req, res) => {
  res.json({
    message: '📚 API de Scraping de Livros Amazon',
    endpoints: {
      'GET /': 'Esta página',
      'GET /api/books': 'Listar livros encontrados',
      'POST /api/scrape': 'Fazer scraping (body: { searchTerm: "nome do livro" })',
      'GET /api/scrape/:term': 'Buscar livros por termo na URL'
    },
    totalBooks: scrapedBooks.length
  });
});

// Listar todos os livros encontrados
app.get('/api/books', (req, res) => {
  res.json({
    success: true,
    total: scrapedBooks.length,
    books: scrapedBooks
  });
});

// Fazer scraping via POST
app.post('/api/scrape', async (req, res) => {
  const { searchTerm } = req.body;
  
  if (!searchTerm) {
    return res.status(400).json({
      success: false,
      error: 'searchTerm é obrigatório'
    });
  }
  
  try {
    const books = await scrapeAmazonBooks(searchTerm);
    
    // Adicionar aos livros encontrados (evitar duplicatas)
    books.forEach(book => {
      const exists = scrapedBooks.find(b => b.title === book.title && b.author === book.author);
      if (!exists) {
        scrapedBooks.push(book);
      }
    });
    
    res.json({
      success: true,
      searchTerm,
      found: books.length,
      total: scrapedBooks.length,
      books
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Fazer scraping via GET (mais fácil para testar)
app.get('/api/scrape/:term', async (req, res) => {
  const searchTerm = req.params.term;
  
  try {
    const books = await scrapeAmazonBooks(searchTerm);
    
    // Adicionar aos livros encontrados
    books.forEach(book => {
      const exists = scrapedBooks.find(b => b.title === book.title && b.author === book.author);
      if (!exists) {
        scrapedBooks.push(book);
      }
    });
    
    res.json({
      success: true,
      searchTerm,
      found: books.length,
      total: scrapedBooks.length,
      books
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Limpar cache de livros
app.delete('/api/books', (req, res) => {
  const count = scrapedBooks.length;
  scrapedBooks = [];
  res.json({
    success: true,
    message: `${count} livros removidos do cache`
  });
});

// Rota para debug - ver HTML da página
app.get('/api/debug/:term', async (req, res) => {
  const searchTerm = req.params.term;
  let browser;
  
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    const searchUrl = `https://www.amazon.com.br/s?k=${encodeURIComponent(searchTerm)}&i=stripbooks`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });
    
    const html = await page.content();
    
    // Debug específico para seletores
    const selectorDebug = await page.evaluate(() => {
      const elements = document.querySelectorAll('[data-component-type="s-search-result"]');
      if (elements.length === 0) return { error: 'Nenhum elemento encontrado' };
      
      const firstElement = elements[0];
      const debug = {
        titleElements: [],
        authorElements: [],
        priceElements: []
      };
      
      // Debug títulos
      const titleSelectors = ['h2 a span', 'h2 span', '.s-size-mini span'];
      titleSelectors.forEach(sel => {
        const el = firstElement.querySelector(sel);
        if (el) debug.titleElements.push({ selector: sel, text: el.textContent.trim() });
      });
      
      // Debug autores
      const authorSelectors = [
        'span[data-a-size="base"] .a-link-normal',
        '.a-color-secondary .a-link-normal',
        '.s-link-style a'
      ];
      authorSelectors.forEach(sel => {
        const el = firstElement.querySelector(sel);
        if (el) debug.authorElements.push({ selector: sel, text: el.textContent.trim() });
      });
      
      // Debug preços
      const priceSelectors = ['.a-price .a-offscreen', '.a-price-whole', '.a-color-price'];
      priceSelectors.forEach(sel => {
        const el = firstElement.querySelector(sel);
        if (el) debug.priceElements.push({ selector: sel, text: el.textContent.trim() });
      });
      
      return debug;
    });
    
    res.json({
      success: true,
      searchUrl,
      htmlLength: html.length,
      hasResults: html.includes('[data-component-type="s-search-result"]'),
      hasAlternativeResults: html.includes('.s-result-item'),
      pageTitle: await page.title(),
      selectorDebug
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📚 API de Scraping Amazon disponível`);
  console.log(`🔗 Teste: http://localhost:${PORT}/api/scrape/javascript`);
  console.log(`🐛 Debug: http://localhost:${PORT}/api/debug/javascript`);
});