import React, { useState } from "react";

function SearchBar({ onSearch }){
    const [query, setQuery] = useState("");

    const handleInputChange = (e) => {
        setQuery(e.target.value);
    }

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(query);
    }

    return(
        <form onSubmit={handleSearch}>
            <input 
                type="text"
                placeholder="Digite o nome do livro..."
                value={query}
                onChange={handleInputChange}
            />
            <button type="submit">Buscar</button>
        </form>
    );
}

export default SearchBar;