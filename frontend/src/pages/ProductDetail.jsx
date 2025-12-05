import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productService } from '../services/product.service'
import { categoryService } from '../services/categoryService'
import { ProductCard } from '../components/product/ProductSection'
import { useAuth } from '../context/AuthContext'
import { bidService } from '../services/bid.service'
import LoginRequestModal from '../components/common/LoginRequestModal'
import ToastNotification from '../components/common/ToastNotification'

export default function ProductDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [categoryWithSlug, setCategoryWithSlug] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingRelated, setLoadingRelated] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [minValidPrice, setMinValidPrice] = useState(0)

  useEffect(() => {
    let isMounted = true // tránh lỗi update unmounted component

    const fetchProductData = async (initial = false) => {
      try {
        if (initial) setLoading(true)

        // Lấy chi tiết sản phẩm
        const productRes = await productService.getProductDetail(id)
        if (!isMounted) return
        setProduct(productRes.data)

        // Lấy category đầy đủ
        if (productRes.data?.category) {
          try {
            const categoryRes = await categoryService.getAllCategories()
            if (!isMounted) return
            const fullCategory = categoryRes.data.find(
              cat =>
                cat._id === productRes.data.category._id ||
                cat._id === productRes.data.category
            )
            setCategoryWithSlug(fullCategory)
            
            // GỌI API LIÊN QUAN NGAY SAU KHI CÓ CATEGORY (CHỈ LẦN ĐẦU)
            if (initial && fullCategory?.slug) {
              setLoadingRelated(true)
              const relatedRes = await productService.getRelatedProducts(fullCategory.slug)
              if (!isMounted) return

              const productsArray = Array.isArray(relatedRes)
                ? relatedRes
                : Array.isArray(relatedRes?.data)
                  ? relatedRes.data
                  : []

              console.log("Related products fetched:", productsArray) // Debug
              setRelatedProducts(productsArray)
              setLoadingRelated(false)
            }
          } catch (error) {
            console.error("Lỗi khi lấy thông tin category:", error)
            setLoadingRelated(false)
          }
        }

        // Lấy giá đặt tối thiểu (vẫn polling mỗi 5s)
        if (user) {
          try {
            const priceRes = await productService.getMinValidPrice(id, user._id)
            if (!isMounted) return
            setMinValidPrice(priceRes.min_valid_price)
          } catch (error) {
            console.error("Lỗi khi lấy thông tin giá:", error)
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải chi tiết sản phẩm:", error)
      } finally {
        if (initial) setLoading(false) // chỉ loading lần đầu
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Gọi lần đầu → có loading và load sản phẩm liên quan
    fetchProductData(true)

    // Polling mỗi 5s → chỉ cập nhật product, giá, KHÔNG load lại sản phẩm liên quan
    const interval = setInterval(() => {
      fetchProductData(false)
    }, 5000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [id, user])

  const displayCategory = categoryWithSlug || product?.category

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Đang tải...</div>
  }

  if (!product) {
    return <div className="p-10 text-center text-red-500 font-bold">Không tìm thấy sản phẩm</div>
  }

  return (
    <div className="p-5 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/" className="text-blue-600 hover:underline">Trang chủ</Link>
        <span className="mx-2">&gt;</span>
        <Link to={`/category/${displayCategory?.slug}`} className="text-blue-600 hover:underline">
          {displayCategory?.category_name}
        </Link>
        <span className="mx-2">&gt;</span>
        <span className="text-gray-800 font-medium truncate">{product.product_name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
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
      <RelatedProducts products={relatedProducts} loading={loadingRelated} />
    </div>
  )
}

// Component hiển thị hình ảnh
function ProductImages({ product, selectedImage, onSelectImage }) {
  const allImages = [product.thumbnail, ...(product.images || [])]

  return (
    <div>
      {/* Ảnh lớn */}
      <div className="mb-5 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <img
          src={allImages[selectedImage]}
          alt={product.product_name}
          className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = '/images/placeholder.jpg'
          }}
        />
      </div>

      {/* Danh sách ảnh nhỏ */}
      <div className="flex gap-3 flex-wrap">
        {allImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Ảnh ${index + 1}`}
            className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all duration-200 ${selectedImage === index
              ? 'border-blue-600 ring-2 ring-blue-100 scale-105'
              : 'border-transparent hover:border-gray-300'
              }`}
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
  // State cho yêu thích
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Kiểm tra trạng thái yêu thích
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user && product._id) {
        try {
          const result = await productService.checkIsWatching(product._id);
          if (result && result.is_watching) {
            setIsFavorite(true);
          }
        } catch (error) {
          console.error("Lỗi check favorite:", error);
        }
      }
    };

    checkFavoriteStatus();
  }, [user, product._id]);

  // Hàm toggle yêu thích
  const handleToggleFavorite = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      await productService.toggleWatchList(product._id);
      setIsFavorite((prev) => !prev);
    } catch (error) {
      const message = error?.response?.data?.message || "Có lỗi xảy ra, thử lại sau!";
      ToastNotification(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Component nút yêu thích
  const FavoriteButton = () => (
    <button
      type="button"
      disabled={isLoading}
      onClick={handleToggleFavorite}
      title={isFavorite ? "Bỏ theo dõi" : "Theo dõi sản phẩm"}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 disabled:opacity-50 cursor-pointer"
      style={{
        backgroundColor: isFavorite ? '#FEE2E2' : '#F3F4F6',
        borderColor: isFavorite ? '#FCA5A5' : '#D1D5DB',
        color: isFavorite ? '#DC2626' : '#4B5563'
      }}
    >
      <img
        src={isFavorite ? "/red_heart.png" : "/white_heart.png"}
        alt="Favorite Icon"
        className="w-5 h-5 object-contain"
      />
      <span className="font-semibold">
        {isFavorite ? "Đang theo dõi" : "Theo dõi sản phẩm"}
      </span>
    </button>
  );

  const formatPrice = (price) => {
    if (!price || isNaN(price)) {
      console.warn("Giá không hợp lệ:", price);
      return '0';
    }
    return new Intl.NumberFormat('vi-VN').format(price);
  };

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
    <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm h-fit">
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-3xl font-bold text-blue-900 mb-4 leading-tight">
          {product.product_name}
        </h1>

        {/* Nút yêu thích */}
        <div className="ml-4">
          <FavoriteButton />
        </div>
      </div>

      {/* Trạng thái đấu giá */}
      <div className={`inline-block px-4 py-2 rounded-full mb-6 text-sm font-bold border ${isAuctionActive()
        ? 'bg-green-50 border-green-200 text-green-700'
        : 'bg-yellow-50 border-yellow-200 text-yellow-700'
        }`}>
        {isAuctionActive() ? '🟢 Đang đấu giá' : '🟡 Đã kết thúc'}
      </div>

      {/* Giá hiện tại */}
      <div className="mb-5 pb-5 border-b border-gray-100">
        <div className="text-sm text-gray-500 mb-1 font-medium uppercase tracking-wide">💰 Giá hiện tại</div>
        <div className="text-3xl font-bold text-red-600">
          ₫{formatPrice(product.current_highest_price || product.start_price)}
        </div>
      </div>

      {/* Giá mua ngay */}
      {product.buy_it_now_price && product.buy_it_now_price > 0 && (
        <div className="mb-5">
          <div className="text-sm text-gray-500 mb-1 font-medium">🎯 Giá mua ngay</div>
          <div className="text-xl font-bold text-blue-600">
            ₫{formatPrice(product.buy_it_now_price)}
          </div>
        </div>
      )}

      {/* Giá đặt tối thiểu */}
      {minValidPrice > 0 && (
        <div className="mb-5">
          <div className="text-sm text-gray-500 mb-1 font-medium">📊 Giá đặt tối thiểu</div>
          <div className="text-lg font-bold text-gray-800">
            ₫{formatPrice(minValidPrice)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Bước giá: ₫{formatPrice(product.bid_increment)}
          </div>
        </div>
      )}

      {/* Thông tin đấu giá */}
      <div className={`p-4 rounded-lg mb-6 border ${isEndingSoon() ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'
        }`}>
        <div className="flex justify-between mb-3 items-center">
          <span className="font-bold text-gray-700">⏳ Thời gian còn lại:</span>
          <span className={`font-bold ${isEndingSoon() ? 'text-red-600' : 'text-green-600'}`}>
            {getTimeRemaining(product.auction_end_time)}
          </span>
        </div>
        <div className="flex justify-between mb-3 items-center">
          <span className="text-gray-600">🔁 Số lượt ra giá:</span>
          <span className="font-semibold text-gray-900">{product.bid_count || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">📈 Bước giá:</span>
          <span className="font-semibold text-gray-900">₫{formatPrice(product.bid_increment)}</span>
        </div>
      </div>

      {/* Thông tin người bán */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
          {product.seller?.full_name?.charAt(0) || 'A'}
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase font-semibold">👤 Người bán</div>
          <div className="font-bold text-gray-900">{product.seller?.full_name || "Ẩn danh"}</div>
          <div className="text-xs text-yellow-500 flex items-center">
            ⭐ 4.8/5 <span className="text-gray-400 ml-1">(124 đánh giá)</span>
          </div>
        </div>
      </div>

      {/* Thông tin người đặt giá cao nhất */}
      {product.current_highest_bidder && (
        <div className="mb-6 flex items-center gap-3 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
          <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {product.current_highest_bidder.full_name?.charAt(0) || 'B'}
          </div>
          <div>
            <div className="text-xs text-yellow-700 uppercase font-bold mb-0.5">👑 Người giữ giá cao nhất</div>
            <div className="font-bold text-gray-900">{product.current_highest_bidder.full_name}</div>
          </div>
        </div>
      )}

      {/* Thời gian đăng & kết thúc */}
      <div className="border-t border-gray-100 pt-4 text-sm text-gray-600 space-y-2">
        <div className="flex justify-between">
          <span>📅 Thời điểm đăng:</span>
          <span className="font-medium text-gray-800">{formatDate(product.auction_start_time)}</span>
        </div>
        <div className="flex justify-between">
          <span>🕒 Thời điểm kết thúc:</span>
          <span className="font-medium text-gray-800">{formatDate(product.auction_end_time)}</span>
        </div>
      </div>
      <LoginRequestModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        productName={product.product_name}
      />
    </div>
  )
}

// Component mô tả chi tiết
function ProductDescription({ product }) {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-blue-600 inline-block text-gray-800">
        📝 Mô tả chi tiết
      </h2>
      <div className="bg-white p-6 rounded-xl border border-gray-200 text-gray-700 leading-relaxed whitespace-pre-wrap">
        {product.description || 'Chưa có mô tả cho sản phẩm này.'}
      </div>
    </div>
  )
}

// Component đặt giá & lịch sử
function BiddingSection({ product, minValidPrice, user }) {
  const [bidAmount, setBidAmount] = useState(minValidPrice || product.start_price)
  const [bidHistory, setBidHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    setBidAmount(minValidPrice > 0 ? minValidPrice : product.start_price);
  }, [minValidPrice]);

  const formatDateTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Hàm lấy lịch sử đấu giá
  const fetchBidHistory = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (loadingHistory) return;

    try {
      setLoadingHistory(true);
      const history = await bidService.getBidHistory(product._id);

      const list = Array.isArray(history) ? history : (history?.data || []);
      setBidHistory(list);
      setShowHistory(true);
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử đấu giá:", error);
      ToastNotification("Không thể tải lịch sử đấu giá", 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

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
    const response = await bidService.placeBid(product._id, bidAmount)

    fetchBidHistory();

  }

  // Hàm mask tên - giữ nguyên từ cuối cùng, bỏ phần trong ngoặc
  const maskName = (name) => {
    if (!name || typeof name !== 'string') return '**** danh';

    // Lấy phần trước dấu ngoặc
    const mainName = name.split('(')[0].trim();
    if (!mainName) return '**** danh';

    // Lấy từ cuối cùng
    const words = mainName.split(/\s+/);
    const lastWord = words[words.length - 1];
    if (!lastWord) return '**** danh';

    return '****' + lastWord;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold pb-2 border-b-2 border-blue-600 inline-block text-gray-800">
          💰 Đặt giá & Lịch sử đấu giá
        </h2>

        {/* Nút xem lịch sử */}
        <button
          onClick={fetchBidHistory}
          disabled={loadingHistory}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border border-blue-200 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loadingHistory ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></span>
              Đang tải...
            </>
          ) : (
            <>
              <span>📋</span>
              Xem lịch sử đấu giá
            </>
          )}
        </button>
      </div>

      {/* Phần đặt giá */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
        {user ? (
          <div>
            <div className="mb-4">
              <label className="block mb-2 font-bold text-gray-700">
                Giá đặt của bạn (₫)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    min={minValidPrice}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium text-gray-900"
                  />
                  <div className="text-sm text-gray-500 mt-2 ml-1">
                    Giá đặt tối thiểu: <span className="font-semibold text-gray-700">₫{formatPrice(minValidPrice)}</span>
                  </div>
                </div>

                <button
                  onClick={handleBid}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors active:scale-95 whitespace-nowrap h-[54px] cursor-pointer"
                >
                  Đặt giá ngay
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4 font-medium">Vui lòng đăng nhập để tham gia đấu giá sản phẩm này</p>
            <Link to="/login">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-md cursor-pointer"
              >
                Đăng nhập ngay
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Phần lịch sử đấu giá */}
      {showHistory && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              📜 Lịch sử đấu giá ({bidHistory.length} lượt)
            </h3>
            <button
              onClick={() => setShowHistory(false)}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {bidHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Chưa có lượt đấu giá nào
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Thời điểm</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Người đấu giá</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Giá vào sản phẩm</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Người giữ giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bidHistory.map((bid, index) => {
                      // Lấy tên bidder
                      const bidderName = bid.user?.full_name || 'Ẩn danh';

                      // Lấy tên holder
                      const holderName = bid.holder?.full_name || 'Ẩn danh';

                      // Lấy giá từ price
                      const bidAmount = bid.price || 0;

                      // Lấy thời gian từ createdAt hoặc date
                      const createdAt = bid.createdAt || bid.date || '';

                      return (
                        <tr
                          key={bid._id || index}
                          className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                        >
                          <td className="py-3 px-4 border-b">
                            <div className="font-medium text-gray-900">
                              {formatDateTime(createdAt)}
                            </div>
                          </td>
                          <td className="py-3 px-4 border-b">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {bidderName?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <span className="font-medium text-gray-800">
                                {maskName(bidderName)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 border-b">
                            <div className="font-bold text-red-600 text-lg">
                              ₫{formatPrice(bidAmount)}
                            </div>
                          </td>
                          <td className="py-3 px-4 border-b">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {holderName?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <span className="font-medium text-gray-800">
                                {maskName(holderName)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal yêu cầu đăng nhập */}
      <LoginRequestModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}

// Component Q&A
function ProductQA({ productId }) {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-blue-600 inline-block text-gray-800">
        ❓ Hỏi & Đáp
      </h2>
      <div className="bg-white p-10 text-center rounded-xl border border-gray-200 text-gray-500 italic">
        Tính năng đang được phát triển...
      </div>
    </div>
  )
}

// Component sản phẩm liên quan
function RelatedProducts({ products, loading = false }) {
  if (loading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-blue-600 inline-block text-gray-800">
          🔄 Sản phẩm cùng chuyên mục
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-blue-600 inline-block text-gray-800">
          🔄 Sản phẩm cùng chuyên mục
        </h2>
        <div className="text-center py-8 text-gray-500 italic">
          Chưa có sản phẩm nào cùng chuyên mục
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-blue-600 inline-block text-gray-800">
        🔄 Sản phẩm cùng chuyên mục ({products.length} sản phẩm)
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
