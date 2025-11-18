const API_URL = "http://localhost:3001/api";

export const searchBooks = async (query) => {
    if (!query) return [];

    try {
        console.log(`🔍 Buscando livros no backend: ${query}`);
        
        const response = await fetch(`${API_URL}/scrape`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ searchTerm: query })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Backend response:', data);
        
        if (!data.success) {
            throw new Error(data.error || 'Erro ao buscar livros');
        }
        
        // Transformar formato do backend para o formato esperado pelo frontend
        return data.books.map(book => ({
            id: book.id,
            volumeInfo: {
                title: book.title,
                authors: [book.author],
                imageLinks: {
                    thumbnail: book.image || 'https://via.placeholder.com/128x192?text=Sem+Capa'
                },
                previewLink: book.link,
                description: `Preço: ${book.price} | Avaliação: ${book.rating}`
            }
        }));
        
    } catch (error) {
        console.error('Erro ao buscar livros no backend:', error);
        return [];
    }
};