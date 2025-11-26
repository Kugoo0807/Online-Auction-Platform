import { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) onSearch(query);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div style={{ display: 'flex' }}>
      <input
        type="text"
        placeholder="Tìm kiếm sản phẩm..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        style={{ width: '700px', padding: '15px 20px', marginLeft: '10px', fontSize: '18px', border: '2px solid #ccc', borderRadius: '25px 0 0 25px', outline: 'none' }}
      />
      <button
        onClick={handleSearch}
        style={{ backgroundColor: '#004E92', color: 'white', border: 'none', borderRadius: '0 25px 25px 0', cursor: 'pointer', fontSize: '18px', padding: '0 25px' }}
      >
        🔍
      </button>
    </div>
  );
}