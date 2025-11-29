import { Link } from 'react-router-dom'

// Utility functions
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price)
}

const getTimeRemaining = (endTime) => {
  const now = new Date()
  const end = new Date(endTime)
  const diff = end - now
  
  if (diff <= 0) return 'Đã kết thúc'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) {
    return `${days} ngày ${hours} giờ`
  } else if (hours > 0) {
    return `${hours} giờ ${minutes} phút`
  } else {
    return `${minutes} phút`
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN')
}

export default function ProductSection({ title, products, loading = false }) {
  if (loading) {
    return (
      <div style={{ marginBottom: '40px', marginTop: '30px' }}>
        <h2
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'white',
            width: 'fit-content',
            borderRadius: '20px',
            padding: '8px 16px',
            marginBottom: '20px',
            fontWeight: '700',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          }}
        >
          🏷️ {title}
        </h2>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Đang tải sản phẩm...
        </div>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div style={{ marginBottom: '40px', marginTop: '30px' }}>
        <h2
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'white',
            width: 'fit-content',
            borderRadius: '20px',
            padding: '8px 16px',
            marginBottom: '20px',
            fontWeight: '700',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          }}
        >
          🏷️ {title}
        </h2>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Không có sản phẩm nào
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: '40px', marginTop: '30px' }}>
      {/* Tiêu đề section */}
      <h2
        style={{
          backgroundColor: 'var(--color-accent)',
          color: 'white',
          width: 'fit-content',
          borderRadius: '20px',
          padding: '8px 16px',
          marginBottom: '20px',
          fontWeight: '700',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        }}
      >
        🏷️ {title}
      </h2>

      {/* Vùng chứa các card */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
          width: '100%'
        }}
      >
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  )
}

// Component thẻ sản phẩm
export function ProductCard({ product }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-card-bg)',
        border: '1px solid var(--color-card-border)',
        borderRadius: '12px',
        padding: '12px',
        width: '300px',
        height: '500px',
        textAlign: 'center',
        boxShadow: '0 6px 12px rgba(13,27,42,0.06)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)'
        e.currentTarget.style.boxShadow = '0 12px 20px rgba(13,27,42,0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 6px 12px rgba(13,27,42,0.06)'
      }}
    >
      <img
        src={product.thumbnail}
        alt={product.product_name}
        style={{
          width: '100%',
          height: '200px',
          objectFit: 'cover',
          borderRadius: '8px',
        }}
        onError={(e) => {
          e.target.src = '/images/placeholder.jpg' // Fallback image
        }}
      />
      <h3
        style={{
          color: 'var(--color-primary)',
          fontSize: '20px',
          marginBottom: '8px',
        }}
      >
        {product.product_name}
      </h3>
      
      {/* Thông tin sản phẩm */}
      <ProductInfo product={product} />
      
      <Link
        to={`/auction/${product._id}`}
        style={{
          color: 'var(--color-secondary)',
          fontWeight: '600',
          textDecoration: 'none',
          fontSize: '13px',
          display: 'inline-block',
          marginTop: '8px'
        }}
        onMouseEnter={(e) => (e.target.style.color = 'var(--color-accent)')}
        onMouseLeave={(e) => (e.target.style.color = 'var(--color-secondary)')}
      >
        Xem chi tiết
      </Link>
    </div>
  )
}

// Component hiển thị thông tin sản phẩm
function ProductInfo({ product }) {
  return (
    <div
      style={{
        color: 'var(--color-text)',
        fontSize: '14px',
        marginBottom: '10px',
        textAlign: 'left',
        lineHeight: '1.5',
      }}
    >
      {/* Giá hiện tại */}
      <div style={{ display: 'flex', marginBottom: '4px' }}>
        <span style={{ minWidth: '120px', fontWeight: 'bold' }}>📌 Giá hiện tại:</span>
        <span>₫{formatPrice(product.current_highest_price || product.start_price)}</span>
      </div>

      {/* Người bán */}
      <div style={{ display: 'flex', marginBottom: '4px' }}>
        <span style={{ minWidth: '120px', fontWeight: 'bold' }}>👤 Người bán:</span>
        <span>{product.seller?.full_name || "Ẩn danh"}</span>
      </div>

      {/* Giá mua ngay - nếu có */}
      {product.buy_it_now_price && product.buy_it_now_price > 0 && (
        <div style={{ display: 'flex', marginBottom: '4px' }}>
          <span style={{ minWidth: '120px', fontWeight: 'bold' }}>💰 Mua ngay:</span>
          <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>
            ₫{formatPrice(product.buy_it_now_price)}
          </span>
        </div>
      )}

      {/* Ngày đăng */}
      <div style={{ display: 'flex', marginBottom: '4px' }}>
        <span style={{ minWidth: '120px', fontWeight: 'bold' }}>📅 Ngày đăng:</span>
        <span>{formatDate(product.auction_start_time || product.createdAt)}</span>
      </div>

      {/* Thời gian còn lại */}
      <div style={{ display: 'flex', marginBottom: '4px' }}>
        <span style={{ minWidth: '120px', fontWeight: 'bold' }}>⏳ Còn lại:</span>
        <span style={{ 
          color: getTimeRemaining(product.auction_end_time).includes('phút') 
            ? 'var(--color-accent)' 
            : 'inherit',
          fontWeight: getTimeRemaining(product.auction_end_time).includes('phút') ? 'bold' : 'normal'
        }}>
          {getTimeRemaining(product.auction_end_time)}
        </span>
      </div>

      {/* Số lượt ra giá */}
      <div style={{ display: 'flex', marginBottom: '4px' }}>
        <span style={{ minWidth: '120px', fontWeight: 'bold' }}>🔁 Lượt ra giá:</span>
        <span>{product.bid_count || 0}</span>
      </div>

    </div>  
  )
}