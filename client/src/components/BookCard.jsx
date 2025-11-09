import React from "react";


function BookCard({ book, children }){
    const imageUrl = book.volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/128x195.png?text=No+Image";
    const title = book.volumeInfo.title || "Titulo desconhecido";
    const authors = book.volumeInfo.authors || "Autores desconhecidos";

    return(
        <div className="book-card">
            <img src={imageUrl} alt={`Capa do livro: ${title}`} />
            <div className="book-info">
                <h3>{title}</h3>
                <p>{Array.isArray(authors) ? authors.join(", ") : authors}</p>
                {children}
            </div>
        </div>
    );
}

export default BookCard;