import React from "react";
import BookCard from "./BookCard";

function BookList({ books, onAddToWishlist }) {
    if(books.length === 0){
        return <p>Nenhum livro encontrado.</p>;
    }

    return (
        <div className="book-list-container">
            {books.map((book, index) => (
                <BookCard key={`${book.id}-${index}`} book={book}>
                    <button onClick={() => onAddToWishlist(book)}>Adicionar à lista de desejos</button>
                </BookCard>
            ))}
        </div>
    );
}

export default BookList;