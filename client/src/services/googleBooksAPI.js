const API_URL = "https://www.googleapis.com/books/v1/volumes";
const API_KEY = import.meta.env.VITE_CHAVE_GOOGLE_LIVROS;

export const searchBooks = async (query) => {
    if (!query) return [];

    const buildUrl = (useKey = true) => {
        const base = `${API_URL}?q=${encodeURIComponent(query)}`;
        return useKey && API_KEY ? `${base}&key=${API_KEY}` : base;
    };

    try {
        // Primeiro tenta com a chave (se existir)
        let response = await fetch(buildUrl(Boolean(API_KEY)));

        // Se obteve 403 (chave inválida/restrita), tenta sem chave como fallback
        if (response.status === 403 && API_KEY) {
            console.warn('Request returned 403 using API key — retrying without key. If this fixes it, check key restrictions in Google Cloud Console.');
            response = await fetch(buildUrl(false));
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Google Books response:', data);
        return data.items || [];
    } catch (error) {
        if (error.message && error.message.includes('403')) {
            console.error('Erro 403 ao buscar livros: chave inválida ou restrições aplicadas à chave da API. Verifique https://console.cloud.google.com/apis/credentials — habilite a Google Books API, remova restrições de aplicativo ou habilite faturamento se necessário.', error);
        } else {
            console.error('Erro ao buscar livros:', error);
        }
        return [];
    }
};