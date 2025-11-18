import React, { useState } from "react";

function SearchBar({ onSearch, disabled }){
    const [query, setQuery] = useState("");

    const handleInputChange = (e) => {
        setQuery(e.target.value);
    }

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim() && !disabled) {
            onSearch(query);
        }
    }

    return(
        <form onSubmit={handleSearch} className="search-form">
            <div className="search-row">
                <input 
                    type="text"
                    placeholder="Digite o nome do livro que você procura..."
                    value={query}
                    onChange={handleInputChange}
                    className="input-primary"
                    disabled={disabled}
                />
                <button 
                    type="submit"
                    className="btn-primary"
                    disabled={disabled || !query.trim()}
                >
                    {disabled ? '⏳ Buscando...' : '🔍 Buscar'}
                </button>
            </div>
        </form>
    );
}

export default SearchBar;