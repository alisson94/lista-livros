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

    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }, [wishlist]);

    const handleSearch = async (query) => {
        const results = await searchBooks(query);
        setBooks(results);
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
            <header>
                <h1>Minha lista de Livros</h1>
                <SearchBar onSearch={handleSearch} />
            </header>
            <main>
                <section>
                    <h2>Lista de Desejos</h2>
                    <WishList books={wishlist} onRemoveFromWishlist={handleRemoveFromWishlist} />
                </section>
                
                <hr />

                <section>
                    <h2>Resultados Busca</h2>
                    <BookList books={books} onAddToWishlist={handleAddToWishlist} />
                </section>
            </main>
        </div>
    );
}

export default App
