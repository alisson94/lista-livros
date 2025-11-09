import React from "react";
import BookCard from "./BookCard";

function WishList({ books, onRemoveFromWishlist }){
    if(books.length === 0){
        return <p>Sua lista de desejos está vazia.</p>;
    }

    return(
        <div className="wishlist-container">
            {books.map((book) => (
                <BookCard key={book.id} book={book}>
                    <button onClick={() => onRemoveFromWishlist(book.id)}>Remover da lista de desejos</button>
                </BookCard>
            ))}
        </div>
    );
}

export default WishList;