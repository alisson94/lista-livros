import React,{ useState, useEffect } from 'react'
import { searchBooks } from './services/googleBooksAPI'
import BookList from './components/BookList'
import WishList from './components/WishList'
import SearchBar from './components/SearchBar'


function App() {
    const [books, setBooks] = useState([]);
    const [wishlist, setWishlist] = useState(()=>{
        const savedWishlist = localStorage.getItem("wishlist");
        return savedWishlist ? JSON.parse(savedWishlist) : [];
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }, [wishlist]);

    const handleSearch = async (query) => {
        setLoading(true);
        setError(null);
        setBooks([]);
        
        try {
            const results = await searchBooks(query);
            setBooks(results);
            
            if (results.length === 0) {
                setError('Nenhum livro encontrado. Tente outra busca.');
            }
        } catch (err) {
            setError('Erro ao buscar livros. Tente novamente.');
            console.error('Erro na busca:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleAddToWishlist = (book) => {
        setWishlist((prevWishlist) => [...prevWishlist, book]);
    };

    const handleRemoveFromWishlist = (bookId) => {
        setWishlist((prevWishlist) =>
            prevWishlist.filter((book) => book.id !== bookId)
        );
    };

    return (
        <div className="app">
            <header className="app-header">
                <div className="container">
                    <h1 className="site-title">
                        📚 Minha Lista de Livros
                    </h1>
                    <SearchBar onSearch={handleSearch} disabled={loading} />
                </div>
            </header>
            <main className="main container">
                <section className="section">
                    <h2 className="section-title">
                        ⭐ Lista de Desejos
                        <span className="count-badge">
                            {wishlist.length} {wishlist.length === 1 ? 'livro' : 'livros'}
                        </span>
                    </h2>
                    <WishList books={wishlist} onRemoveFromWishlist={handleRemoveFromWishlist} />
                </section>
                
                <div className="divider"></div>

                <section className="section">
                    <h2 className="section-title">
                        🔍 Resultados da Busca
                        <span className="count-badge">
                            {books.length} {books.length === 1 ? 'livro' : 'livros'}
                        </span>
                    </h2>
                    
                    {loading && (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p className="loading-text">
                                🔍 Buscando livros na Amazon...
                                <span className="loading-subtext">Isso pode levar alguns segundos</span>
                            </p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            {error}
                        </div>
                    )}
                    
                    {!loading && !error && <BookList books={books} onAddToWishlist={handleAddToWishlist} />}
                </section>
            </main>
        </div>
    );
}

export default App
