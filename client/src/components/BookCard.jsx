import React from "react";


function BookCard({ book, children }){
    const imageUrl = book.volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/128x195.png?text=No+Image";
    const title = book.volumeInfo.title || "Titulo desconhecido";
    const authors = book.volumeInfo.authors || "Autores desconhecidos";

    return(
        <div className="book-card">
            <div className="cover">
                <img 
                    src={imageUrl} 
                    alt={`Capa do livro: ${title}`}
                />
            </div>
            <div className="card-body">
                <h3 className="card-title line-clamp-2">
                    {title}
                </h3>
                <p className="card-authors line-clamp-2">
                    {Array.isArray(authors) ? authors.join(", ") : authors}
                </p>
                <div className="card-actions">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default BookCard;