import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/product.service';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]); 
  const [trending, setTrending] = useState([]); 
  const [showDropdown, setShowDropdown] = useState(false);
  
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const DEFAULT_IMAGE = "https://placehold.co/50x50?text=No+Img";

  // --- 1. Load dữ liệu ban đầu ---
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    setHistory(savedHistory);

    const fetchTrending = async () => {
        try {
            const res = await productService.getTopBidded();
            const products = res.data || res || [];
            setTrending(products.slice(0, 3));
        } catch (error) {
            console.error("Lỗi lấy trending:", error);
        }
    };
    fetchTrending();
  }, []);

  // --- 2. Quản lý Lịch sử ---
  const saveToHistory = (keyword) => {
      if (!keyword.trim()) return;
      let newHistory = [keyword, ...history.filter(item => item !== keyword)];
      newHistory = newHistory.slice(0, 5);
      setHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const removeHistoryItem = (e, itemToRemove) => {
      e.stopPropagation(); 
      const newHistory = history.filter(item => item !== itemToRemove);
      setHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const clearAllHistory = () => {
      setHistory([]);
      localStorage.removeItem('searchHistory');
  };

  // --- 3. Debounce Search ---
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await productService.searchProducts(query);
        const results = res.data || res || [];
        setSuggestions(results.slice(0, 5));
      } catch (error) {
        console.error("Lỗi gợi ý:", error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click ra ngoài để đóng dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Các hành động điều hướng
  const handleSearch = () => {
    setShowDropdown(false);
    if (query.trim()) {
        saveToHistory(query.trim());
        onSearch(query);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSelectProduct = (productId) => {
    setShowDropdown(false);
    navigate(`/auction/${productId}`);
  };

  const handleSelectKeyword = (keyword) => {
      setQuery(keyword);
      saveToHistory(keyword);
      onSearch(keyword);
      setShowDropdown(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', display: 'flex' }}>
      <input
        type="text"
        placeholder="Tìm kiếm sản phẩm..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        onKeyPress={handleKeyPress}
        style={{ 
          width: '700px', 
          padding: '15px 20px', 
          marginLeft: '10px', 
          fontSize: '16px', 
          border: '2px solid #ccc', 
          borderRadius: '25px 0 0 25px', 
          outline: 'none',
          borderRight: 'none',
        }}
      />
      <button
        onClick={handleSearch}
        style={{ 
          backgroundColor: '#004E92', 
          color: 'white', 
          border: 'none', 
          borderRadius: '0 25px 25px 0', 
          cursor: 'pointer', 
          fontSize: '18px', 
          padding: '0 25px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center' 
        }}
      >
        🔍
      </button>

      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '10px',
          width: '700px',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          zIndex: 1000,
          border: '1px solid #eee',
          overflow: 'hidden',
          marginTop: '5px'
        }}>
            
            {/* TRƯỜNG HỢP 1: Đang gõ chữ -> Hiện gợi ý sản phẩm */}
            {query.trim().length >= 2 ? (
                <>
                    {suggestions.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {suggestions.map((product) => (
                                <li 
                                    key={product._id}
                                    onClick={() => handleSelectProduct(product._id)}
                                    style={{ display: 'flex', alignItems: 'center', padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                >
                                    {/* Ảnh sản phẩm được resize chuẩn */}
                                    <img 
                                        src={product.thumbnail || (product.images && product.images[0]) || DEFAULT_IMAGE} 
                                        alt={product.product_name}
                                        style={{ 
                                            width: '40px', 
                                            height: '40px', 
                                            objectFit: 'contain', // Giữ tỷ lệ ảnh, không bị méo
                                            borderRadius: '4px', 
                                            marginRight: '15px',
                                            border: '1px solid #eee',
                                            backgroundColor: '#fff' 
                                        }}
                                        onError={(e) => {e.target.src = DEFAULT_IMAGE}}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{product.product_name}</div>
                                        <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold' }}>{formatCurrency(product.current_highest_price || product.start_price)}</div>
                                    </div>
                                </li>
                            ))}
                            <li 
                                onClick={handleSearch}
                                style={{ padding: '12px', textAlign: 'center', color: '#004E92', fontSize: '14px', fontWeight: '600', cursor: 'pointer', backgroundColor: '#eef6fc' }}
                            >
                                Xem tất cả kết quả cho "{query}"
                            </li>
                        </ul>
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#777' }}>Không tìm thấy sản phẩm nào</div>
                    )}
                </>
            ) : (
                /* TRƯỜNG HỢP 2: Chưa gõ gì -> Hiện Lịch sử & Xu hướng */
                <div style={{ padding: '15px' }}>
                    
                    {/* Phần Lịch sử tìm kiếm */}
                    {history.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase' }}>🕒 Lịch sử tìm kiếm</div>
                                {/* Nút Xóa Tất Cả */}
                                <span 
                                    onClick={clearAllHistory}
                                    style={{ fontSize: '12px', color: '#e02424', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Xóa tất cả
                                </span>
                            </div>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {history.map((item, index) => (
                                    <span 
                                        key={index}
                                        onClick={() => handleSelectKeyword(item)}
                                        style={{ 
                                            backgroundColor: '#f1f3f5', 
                                            padding: '6px 12px', 
                                            borderRadius: '20px', 
                                            fontSize: '13px', 
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: '#333',
                                            border: '1px solid #e9ecef',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#e9ecef';
                                            e.currentTarget.style.borderColor = '#dee2e6';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f1f3f5';
                                            e.currentTarget.style.borderColor = '#e9ecef';
                                        }}
                                    >
                                        {item}
                                        <span 
                                            onClick={(e) => removeHistoryItem(e, item)}
                                            style={{ marginLeft: '8px', color: '#adb5bd', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                                            title="Xóa từ này"
                                            onMouseEnter={(e) => e.target.style.color = '#e02424'}
                                            onMouseLeave={(e) => e.target.style.color = '#adb5bd'}
                                        >×</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Phần Xu hướng (Trending) */}
                    {trending.length > 0 && (
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#888', marginBottom: '10px', textTransform: 'uppercase' }}>🔥 Đang được quan tâm</div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {trending.map(prod => (
                                    <li 
                                        key={prod._id}
                                        onClick={() => handleSelectProduct(prod._id)}
                                        style={{ padding: '8px 0', cursor: 'pointer', borderBottom: '1px dashed #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <img 
                                                src={prod.thumbnail || (prod.images && prod.images[0]) || DEFAULT_IMAGE} 
                                                style={{ width: '30px', height: '30px', objectFit: 'contain', marginRight: '10px', borderRadius: '4px' }}
                                                onError={(e) => {e.target.src = DEFAULT_IMAGE}}
                                            />
                                            <span style={{ fontSize: '14px', color: '#333' }}>{prod.product_name}</span>
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#e02424', backgroundColor: '#fde8e8', padding: '2px 6px', borderRadius: '10px' }}>Hot</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
      )}
    </div>
  );
}