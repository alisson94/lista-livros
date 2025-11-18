import React from "react";
import BookCard from "./BookCard";

function WishList({ books, onRemoveFromWishlist }){
    if(books.length === 0){
        return (
            <div className="empty-state">
                <div className="emoji">⭐</div>
                <h3>Sua lista de desejos está vazia</h3>
                <p className="muted">Comece a adicionar livros que você quer ler!</p>
            </div>
        );
    }

    return(
        <div className="books-grid">
            {books.map((book) => (
                <BookCard key={book.id} book={book}>
                    <button 
                        onClick={() => onRemoveFromWishlist(book.id)}
                        className="btn-danger"
                    >
                        🗑️ Remover da Lista
                    </button>
                </BookCard>
            ))}
        </div>
    );
}

export default WishList;