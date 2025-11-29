import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productService } from '../services/product.service'
import { categoryService } from '../services/categoryService' 
import { ProductCard } from '../components/ProductSection'
import { useAuth } from '../context/AuthContext'

export default function ProductDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [categoryWithSlug, setCategoryWithSlug] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [minValidPrice, setMinValidPrice] = useState(0)

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true)
        
        // Lấy chi tiết sản phẩm
        const productRes = await productService.getProductDetail(id)
        setProduct(productRes.data)

        // Lấy thông tin category từ categoryService
        if (productRes.data?.category) {
          try {
            const categoryRes = await categoryService.getAllCategories()
            const fullCategory = categoryRes.data.find(
              cat => cat._id === productRes.data.category._id || 
                     cat._id === productRes.data.category // nếu category chỉ là ID string
            )
            setCategoryWithSlug(fullCategory)
          } catch (error) {
            console.error('Lỗi khi lấy thông tin category:', error)
          }
        }

        // Lấy giá đặt thấp nhất nếu user đã đăng nhập
        if (user) {
          try {
            const priceRes = await productService.getMinValidPrice(id, user._id)
            setMinValidPrice(priceRes.min_valid_price)
          } catch (error) {
            console.error('Lỗi khi lấy thông tin giá:', error)
          }
        }
        
        // Lấy sản phẩm cùng danh mục
        if (categoryWithSlug?.slug) {
          const relatedRes = await productService.getRelatedProducts(categoryWithSlug.slug)
          setRelatedProducts(relatedRes.data || [])
        } else if (productRes.data?.category?.slug) {
          const relatedRes = await productService.getRelatedProducts(productRes.data.category.slug)
          setRelatedProducts(relatedRes.data || [])
        }
      } catch (error) {
        console.error('Lỗi khi tải chi tiết sản phẩm:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProductData()
  }, [id, user])

  // Sử dụng categoryWithSlug nếu có, không thì dùng product.category
  const displayCategory = categoryWithSlug || product?.category

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải...</div>
  }

  if (!product) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Không tìm thấy sản phẩm</div>
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: '20px', fontSize: '14px' }}>
        <Link to="/" style={{ color: 'var(--color-primary)' }}>Trang chủ</Link> &gt; 
        <Link to={`/category/${displayCategory?.slug}`} style={{ color: 'var(--color-primary)' }}>
          {displayCategory?.category_name}
        </Link> &gt; 
        <span style={{ color: 'var(--color-text)' }}>{product.product_name}</span>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
        {/* Phần hình ảnh */}
        <ProductImages 
          product={product} 
          selectedImage={selectedImage}
          onSelectImage={setSelectedImage}
        />
        
        {/* Phần thông tin sản phẩm */}
        <ProductInfo 
          product={product} 
          minValidPrice={minValidPrice}
          user={user}
        />
      </div>

      {/* Phần mô tả chi tiết */}
      <ProductDescription product={product} />

      {/* Phần đặt giá & lịch sử đấu giá */}
      <BiddingSection 
        product={product} 
        minValidPrice={minValidPrice} 
        user={user} 
      />

      {/* Phần Q&A */}
      <ProductQA productId={id} />

      {/* Sản phẩm cùng chuyên mục */}
      <RelatedProducts products={relatedProducts} />
    </div>
  )
}

// Component hiển thị hình ảnh
function ProductImages({ product, selectedImage, onSelectImage }) {
  const allImages = [product.thumbnail, ...(product.images || [])]

  return (
    <div>
      {/* Ảnh lớn */}
      <div style={{ marginBottom: '20px' }}>
        <img
          src={allImages[selectedImage]}
          alt={product.product_name}
          style={{
            width: '100%',
            height: '400px',
            objectFit: 'cover',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
          onError={(e) => {
            e.target.src = '/images/placeholder.jpg'
          }}
        />
      </div>
      
      {/* Danh sách ảnh nhỏ */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {allImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Ảnh ${index + 1}`}
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'cover',
              borderRadius: '8px',
              cursor: 'pointer',
              border: selectedImage === index ? '3px solid var(--color-accent)' : '1px solid #ddd',
              transition: 'all 0.2s ease'
            }}
            onClick={() => onSelectImage(index)}
            onError={(e) => {
              e.target.src = '/images/placeholder.jpg'
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Component thông tin sản phẩm
function ProductInfo({ product, minValidPrice, user }) {
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
      return `${days} ngày ${hours} giờ nữa`
    } else if (hours > 0) {
      return `${hours} giờ ${minutes} phút nữa`
    } else {
      return `${minutes} phút nữa`
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isEndingSoon = () => {
    const now = new Date()
    const end = new Date(product.auction_end_time)
    const diff = end - now
    return diff < (3 * 24 * 60 * 60 * 1000) // 3 ngày
  }

  const isAuctionActive = () => {
    const now = new Date()
    const end = new Date(product.auction_end_time)
    return end > now && product.auction_status === 'active'
  }

  return (
    <div style={{ padding: '20px', border: '1px solid var(--color-card-border)', borderRadius: '12px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '15px', color: 'var(--color-primary)' }}>
        {product.product_name}
      </h1>

      {/* Trạng thái đấu giá */}
      <div style={{ 
        padding: '10px 15px',
        borderRadius: '6px',
        marginBottom: '20px',
        backgroundColor: isAuctionActive() ? '#e8f5e8' : '#ffeaa7',
        border: `1px solid ${isAuctionActive() ? '#c8e6c9' : '#ffeaa7'}`,
        color: isAuctionActive() ? '#2e7d32' : '#f57c00',
        fontWeight: 'bold'
      }}>
        {isAuctionActive() ? '🟢 Đang đấu giá' : '🟡 Đã kết thúc'}
      </div>

      {/* Giá hiện tại */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ fontSize: '14px', color: 'var(--color-text)', marginBottom: '5px' }}>💰 Giá hiện tại</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-accent)' }}>
          ₫{formatPrice(product.current_highest_price || product.start_price)}
        </div>
      </div>

      {/* Giá mua ngay */}
      {product.buy_it_now_price && product.buy_it_now_price > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontSize: '14px', color: 'var(--color-text)', marginBottom: '5px' }}>🎯 Giá mua ngay</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-secondary)' }}>
            ₫{formatPrice(product.buy_it_now_price)}
          </div>
        </div>
      )}

      {/* Giá đặt tối thiểu */}
      {minValidPrice > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontSize: '14px', color: 'var(--color-text)', marginBottom: '5px' }}>📊 Giá đặt tối thiểu</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#e74c3c' }}>
            ₫{formatPrice(minValidPrice)}
          </div>
          <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
            Bước giá: ₫{formatPrice(product.bid_increment)}
          </div>
        </div>
      )}

      {/* Thông tin đấu giá */}
      <div style={{ 
        backgroundColor: isEndingSoon() ? '#fff3cd' : '#e8f5e8',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: `1px solid ${isEndingSoon() ? '#ffeaa7' : '#c8e6c9'}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: 'bold' }}>⏳ Thời gian còn lại:</span>
          <span style={{ 
            color: isEndingSoon() ? '#e74c3c' : '#27ae60',
            fontWeight: 'bold'
          }}>
            {getTimeRemaining(product.auction_end_time)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>🔁 Số lượt ra giá:</span>
          <span>{product.bid_count || 0}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>📈 Bước giá:</span>
          <span>₫{formatPrice(product.bid_increment)}</span>
        </div>
      </div>

      {/* Thông tin người bán */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>👤 Người bán</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {product.seller?.full_name?.charAt(0) || 'A'}
          </div>
          <div>
            <div style={{ fontWeight: 'bold' }}>{product.seller?.full_name || "Ẩn danh"}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text)' }}>⭐ 4.8/5 (124 đánh giá)</div>
          </div>
        </div>
      </div>

      {/* Thông tin người đặt giá cao nhất */}
      {product.current_highest_bidder && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>👑 Người đặt giá cao nhất</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '35px',
              height: '35px',
              borderRadius: '50%',
              backgroundColor: '#f39c12',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '12px'
            }}>
              {product.current_highest_bidder.full_name?.charAt(0) || 'B'}
            </div>
            <div>
              <div style={{ fontWeight: 'bold' }}>{product.current_highest_bidder.full_name}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text)' }}>⭐ 4.5/5 (89 đánh giá)</div>
            </div>
          </div>
        </div>
      )}

      {/* Thời gian đăng & kết thúc */}
      <div style={{ borderTop: '1px solid var(--color-card-border)', paddingTop: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>📅 Thời điểm đăng:</span>
          <span>{formatDate(product.auction_start_time)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>🕒 Thời điểm kết thúc:</span>
          <span>{formatDate(product.auction_end_time)}</span>
        </div>
      </div>
    </div>
  )
}

// Component mô tả chi tiết
function ProductDescription({ product }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ 
        fontSize: '24px', 
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: '2px solid var(--color-primary)'
      }}>
        📝 Mô tả chi tiết
      </h2>
      <div 
        style={{ 
          lineHeight: '1.6',
          fontSize: '16px',
          color: 'var(--color-text)',
          whiteSpace: 'pre-wrap'
        }}
      >
        {product.description || 'Chưa có mô tả cho sản phẩm này.'}
      </div>
    </div>
  )
}

// Component đặt giá & lịch sử
function BiddingSection({ product, minValidPrice, user }) {
  const [bidAmount, setBidAmount] = useState(minValidPrice || product.start_price)

  const handleBid = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để đặt giá!')
      return
    }

    if (bidAmount < minValidPrice) {
      alert(`Giá đặt phải tối thiểu ₫${minValidPrice.toLocaleString('vi-VN')}`)
      return
    }

    // TODO: Gọi API đặt giá
    alert(`Đã đặt giá ₫${bidAmount.toLocaleString('vi-VN')}`)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ 
        fontSize: '24px', 
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: '2px solid var(--color-primary)'
      }}>
        💰 Đặt giá
      </h2>
      
      <div style={{ 
        padding: '20px', 
        backgroundColor: 'var(--color-card-bg)',
        borderRadius: '8px',
        border: '1px solid var(--color-card-border)'
      }}>
        {user ? (
          <div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Giá đặt của bạn (₫)
              </label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                min={minValidPrice}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
              <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                Giá đặt tối thiểu: ₫{formatPrice(minValidPrice)}
              </div>
            </div>
            <button
              onClick={handleBid}
              style={{
                padding: '12px 30px',
                backgroundColor: 'var(--color-accent)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              Đặt giá ngay - ₫{formatPrice(bidAmount)}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--color-text)' }}>
            <p>Vui lòng đăng nhập để tham gia đấu giá</p>
            <Link to="/login">
              <button style={{
                padding: '10px 20px',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                marginTop: '10px'
              }}>
                Đăng nhập ngay
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

// Component Q&A (Tạm thời để placeholder)
function ProductQA({ productId }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ 
        fontSize: '24px', 
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: '2px solid var(--color-primary)'
      }}>
        ❓ Hỏi & Đáp
      </h2>
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        color: 'var(--color-text)',
        backgroundColor: 'var(--color-card-bg)',
        borderRadius: '8px'
      }}>
        Tính năng đang được phát triển...
      </div>
    </div>
  )
}

// Component sản phẩm liên quan
function RelatedProducts({ products }) {
  if (!products || products.length === 0) return null

  return (
    <div>
      <h2 style={{ 
        fontSize: '24px', 
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '2px solid var(--color-primary)'
      }}>
        🔄 Sản phẩm cùng chuyên mục
      </h2>
      <div style={{
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        justifyContent: 'flex-start'
      }}>
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  )
}