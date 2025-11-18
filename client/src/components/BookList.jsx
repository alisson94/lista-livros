import React from "react";
import BookCard from "./BookCard";

function BookList({ books, onAddToWishlist }) {
    if(books.length === 0){
        return (
            <div className="empty-state">
                <div className="emoji">📖</div>
                <h3>Nenhum livro encontrado</h3>
                <p className="muted">Tente buscar por outro termo ou explore diferentes palavras-chave</p>
            </div>
        );
    }

    return (
        <div className="books-grid">
            {books.map((book, index) => (
                <BookCard key={`${book.id}-${index}`} book={book}>
                    <button 
                        onClick={() => onAddToWishlist(book)}
                        className="btn-success"
                    >
                        ⭐ Adicionar aos Desejos
                    </button>
                </BookCard>
            ))}
        </div>
    );
}

export default BookList;