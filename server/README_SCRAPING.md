# 📚 API de Scraping Amazon - Guia de Uso

O servidor está rodando em `http://localhost:3001`

## 🎯 **Endpoints Disponíveis**

### 1. **Página Principal**
```
GET http://localhost:3001/
```
Mostra informações sobre a API

### 2. **Buscar Livros (Método GET - Mais Fácil)**
```
GET http://localhost:3001/api/scrape/{termo-de-busca}
```

**Exemplos:**
- `http://localhost:3001/api/scrape/javascript`
- `http://localhost:3001/api/scrape/python`
- `http://localhost:3001/api/scrape/harry potter`

### 3. **Buscar Livros (Método POST)**
```
POST http://localhost:3001/api/scrape
Content-Type: application/json

{
  "searchTerm": "javascript"
}
```

### 4. **Ver Todos os Livros Encontrados**
```
GET http://localhost:3001/api/books
```

### 5. **Limpar Cache de Livros**
```
DELETE http://localhost:3001/api/books
```

## 🚀 **Como Testar**

### **Método 1: Navegador**
Abra no navegador:
```
http://localhost:3001/api/scrape/javascript
```

### **Método 2: PowerShell (curl)**
```powershell
# Buscar livros sobre JavaScript
curl http://localhost:3001/api/scrape/javascript

# Ver todos os livros encontrados
curl http://localhost:3001/api/books
```

### **Método 3: Usando Postman/Insomnia**
- URL: `http://localhost:3001/api/scrape/python`
- Método: GET

## 📖 **Exemplo de Resposta**

```json
{
  "success": true,
  "searchTerm": "javascript",
  "found": 10,
  "total": 10,
  "books": [
    {
      "id": 1699539847123,
      "title": "JavaScript: The Good Parts",
      "author": "Douglas Crockford",
      "price": "R$ 89,90",
      "rating": "4,5 de 5 estrelas",
      "link": "https://www.amazon.com.br/...",
      "image": "https://m.media-amazon.com/...",
      "source": "Amazon",
      "scrapedAt": "2024-11-09T17:30:47.123Z"
    }
  ]
}
```

## 🛠️ **Recursos**

- ✅ **Web Scraping Real**: Busca na Amazon Brasil
- ✅ **Cache de Livros**: Armazena resultados encontrados
- ✅ **Anti-Bloqueio**: User-Agent configurado
- ✅ **Modo Visual**: Navegador visível (headless: false)
- ✅ **Dados Completos**: Título, autor, preço, rating, link, imagem
- ✅ **API RESTful**: Endpoints padronizados

## ⚠️ **Importante**

1. **Primeira execução pode ser lenta** - Puppeteer precisa baixar o Chromium
2. **Navegador abrirá visualmente** - Para você ver o scraping acontecendo
3. **Respeite os termos da Amazon** - Use com moderação
4. **Alguns livros podem não ter todos os dados** - Dependendo do layout da página

## 🔥 **Próximos Passos**

1. **Integrar com o Frontend React**
2. **Adicionar mais sites** (Submarino, Americanas)
3. **Salvar em banco de dados**
4. **Adicionar filtros** (preço, rating)
5. **Sistema de wishlist**