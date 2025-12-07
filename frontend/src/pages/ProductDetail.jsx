import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ProductCard } from '../components/product/ProductSection'
import { useAuth } from '../context/AuthContext'

import { bidService } from '../services/bidService'
import { productService } from '../services/product.service'

import LoginRequestModal from '../components/common/LoginRequestModal'
import ToastNotification from '../components/common/ToastNotification'
import ConfirmDialog from '../components/common/ConfirmDialog'
import TextEditor from '../components/common/TextEditor'
import 'react-quill-new/dist/quill.snow.css';

// Helper function tính % rating
function calculateRatingRatio(score, count) {
  if (!count || count === 0) return 0;
  const pos = (score + count) / 2;
  return (pos / count * 100).toFixed(1);
}

// Hàm mask tên
const maskName = (name) => {
  if (!name || typeof name !== 'string') return 'u***r'; 

  // Lọc bỏ phần trong ngoặc () và khoảng trắng thừa
  const cleanName = name.split('(')[0].trim();
  
  if (!cleanName) return 'u***r';

  const chars = Array.from(cleanName);
  const len = chars.length;

  if (len === 1) {
      return `${chars[0]}***${chars[0]}`;
  }

  // CÔNG THỨC EBAY: Ký tự đầu + *** + Ký tự cuối
  const first = chars[0];
  const last = chars[len - 1];
  const middleLength = Math.min(len - 2, 6); 
  const middle = "*".repeat(middleLength);
  
  return `${first}${middle}${last}`;
};

export default function ProductDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  
  // STATE CHUNG (Lift State Up)
  const [product, setProduct] = useState(null)
  const [bidHistory, setBidHistory] = useState([])
  const [questions, setQuestions] = useState([])
  const [relatedProducts, setRelatedProducts] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [loadingRelated, setLoadingRelated] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [minValidPrice, setMinValidPrice] = useState(0)
  
  const isRealSeller = user && product?.seller && (
    (typeof product.seller === 'string' && user._id === product.seller) ||
    (typeof product.seller === 'object' && user._id === product.seller._id)
  );

  const isBannedUser = product?.banned_bidder?.some(
    (id) => id.toString() === user._id.toString()
  );

  const isNewbie = user && (user.rating_count === 0) && product && !product.allow_newbie;

  // Hàm fetch data dùng chung (cho cả initial load, polling, và refresh thủ công)
  const fetchProductData = useCallback(async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) setLoading(true)

      // Lấy chi tiết sản phẩm
      const productRes = await productService.getProductDetail(id)
      const currentProduct = productRes.data
      setProduct(currentProduct)

      // Lấy lịch sử đấu giá
      try {
        const historyRes = await bidService.getBidHistory(id);
        const historyList = Array.isArray(historyRes) ? historyRes : (historyRes?.data || []);
        setBidHistory(historyList);
      } catch (err) {
        console.error("Lỗi silent fetch history:", err);
      }

      // Lấy danh sách hỏi đáp
      try {
        const qaRes = await productService.getQuestions(id);
        const qaList = Array.isArray(qaRes) ? qaRes : (qaRes?.data || []);
        setQuestions(qaList);
      } catch (err) {
        console.error("Lỗi silent fetch Q&A:", err);
      }

      // Lấy Related Products
      if (isInitialLoad && currentProduct?.category?.slug) {
          setLoadingRelated(true)
          try {
              const relatedRes = await productService.getRelatedProducts(currentProduct.category.slug)
              const productsArray = Array.isArray(relatedRes) ? relatedRes : (relatedRes?.data || [])
              setRelatedProducts(productsArray)
          } catch (e) {
              console.error("Lỗi lấy sản phẩm liên quan:", e)
          } finally {
              setLoadingRelated(false)
          }
      }

      // Lấy giá sàn
      const cond_getMinPrice = user && currentProduct.seller && user._id !== (currentProduct.seller._id || currentProduct.seller);
      
      if (cond_getMinPrice) {
        try {
          const priceRes = await productService.getMinValidPrice(id, user._id)
          setMinValidPrice(priceRes.min_valid_price)
        } catch (error) {
          console.error("Lỗi khi lấy thông tin giá:", error)
        }
      }

    } catch (error) {
      console.error("Lỗi khi tải chi tiết sản phẩm:", error)
    } finally {
      if (isInitialLoad) setLoading(false)
    }
  }, [id, user]);

  useEffect(() => {
    let isMounted = true 

    // Wrapper để check mounted
    const safeFetch = async (initial) => {
        if(isMounted) await fetchProductData(initial);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Gọi lần đầu
    safeFetch(true)

    // Polling 5s/lần
    const interval = setInterval(() => {
      safeFetch(false)
    }, 5000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [fetchProductData])

  const displayCategory = product?.category || null;

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
        <ProductImages
          product={product}
          selectedImage={selectedImage}
          onSelectImage={setSelectedImage}
        />

        <ProductInfo
          product={product}
          minValidPrice={minValidPrice}
          user={user}
          isRealSeller={isRealSeller}
        />
      </div>

      <ProductDescription 
        product={product}
        isRealSeller={isRealSeller}
        onRefresh={() => fetchProductData(false)}
      />

      <BiddingSection
        product={product}
        minValidPrice={minValidPrice}
        user={user}
        isRealSeller={isRealSeller}
        isBannedUser={isBannedUser}
        isNewbie={isNewbie}
        bidHistory={bidHistory}
        onRefresh={() => fetchProductData(false)}
      />

      {product.auction_status === 'active' && (
          <>
            <ProductQA 
              product={product}
              user={user}
              isRealSeller={isRealSeller}
              questions={questions}
              onRefresh={() => fetchProductData(false)}
            />
          </>
        )}

      <RelatedProducts products={relatedProducts} loading={loadingRelated} />
    </div>
  )
}

// --- CÁC COMPONENT ---

function ProductImages({ product, selectedImage, onSelectImage }) {
  const allImages = [product.thumbnail, ...(product.images || [])]
  return (
    <div>
      <div className="mb-5 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <img
          src={allImages[selectedImage]}
          alt={product.product_name}
          className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = '/images/placeholder.jpg' }}
        />
      </div>
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
            onError={(e) => { e.target.src = '/images/placeholder.jpg' }}
          />
        ))}
      </div>
    </div>
  )
}

function ProductInfo({ product, minValidPrice, user, isRealSeller }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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
      const message = error?.response?.data?.message || "Có lỗi xảy ra!";
      ToastNotification(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
      <img src={isFavorite ? "/red_heart.png" : "/white_heart.png"} alt="Icon" className="w-5 h-5 object-contain" />
      <span className="font-semibold">{isFavorite ? "Đang theo dõi" : "Theo dõi sản phẩm"}</span>
    </button>
  );

  const formatPrice = (price) => !price || isNaN(price) ? '0' : new Intl.NumberFormat('vi-VN').format(price);
  
  const getTimeRemaining = (endTime) => {
    const now = new Date(); const end = new Date(endTime); const diff = end - now;
    if (diff <= 0) return 'Đã kết thúc';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days} ngày ${hours} giờ nữa`;
    if (hours > 0) return `${hours} giờ ${minutes} phút nữa`;
    return `${minutes} phút nữa`;
  }

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  const isEndingSoon = () => (new Date(product.auction_end_time) - new Date()) < (3 * 24 * 60 * 60 * 1000);
  const isAuctionActive = () => new Date(product.auction_end_time) > new Date() && product.auction_status === 'active';

  return (
    <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm h-fit">
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-3xl font-bold text-blue-900 mb-4 leading-tight">{product.product_name}</h1>
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${isAuctionActive() ? 'bg-green-100 border-green-200 text-green-700' : 'bg-red-100 border-red-200 text-red-700'}`}>
          {isAuctionActive() ? '🟢 Đang đấu giá' : '🔴 Đã kết thúc'}
        </div>
        {!isRealSeller && product.auction_status === 'active' && <FavoriteButton />}
      </div>
      <div className="mb-5 pb-5 border-b border-gray-100">
        <div className="text-sm text-gray-500 mb-1 font-medium uppercase tracking-wide">Giá hiện tại</div>
        <div className="text-3xl font-bold text-red-600">₫{formatPrice(product.current_highest_price || product.start_price)}</div>
      </div>
      {product.buy_it_now_price > 0 && (
        <div className="mb-5">
          <div className="text-sm text-gray-500 mb-1 font-medium">Giá mua ngay</div>
          <div className="text-xl font-bold text-blue-600">₫{formatPrice(product.buy_it_now_price)}</div>
        </div>
      )}
      {!isRealSeller && product.auction_status === 'active' && minValidPrice > 0 && (
        <div className="mb-5">
          <div className="text-sm text-gray-500 mb-1 font-medium">Giá đặt tối thiểu</div>
          <div className="text-lg font-bold text-gray-800">₫{formatPrice(minValidPrice)}</div>
          <div className="text-xs text-gray-500 mt-1">Bước giá: ₫{formatPrice(product.bid_increment)}</div>
        </div>
      )}
      <div className={`p-4 rounded-lg mb-6 border ${isEndingSoon() ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
        <div className="flex justify-between mb-3 items-center">
          <span className="font-bold text-gray-700">⏳ Thời gian còn lại:</span>
          <span className={`font-bold ${isEndingSoon() ? 'text-red-600' : 'text-green-600'}`}>{getTimeRemaining(product.auction_end_time)}</span>
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
      <div className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
          {product.seller?.full_name?.charAt(0) || 'A'}
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase font-semibold">Người bán</div>
          <div className="font-bold text-gray-900">{maskName(product.seller?.full_name) || "Ẩn danh"}</div>
          <div className="text-xs text-yellow-500 flex items-center">
            ⭐ {product.seller ? (isNaN(calculateRatingRatio(product.seller.rating_score, product.seller.rating_count)) ? 'NaN' : calculateRatingRatio(product.seller.rating_score, product.seller.rating_count) + '%') : ''}
            <span className="text-gray-400 ml-1">({product.seller ? product.seller.rating_count : 'Nan'} đánh giá)</span>
          </div>
        </div>
      </div>
      {product.current_highest_bidder && (
        <div className="mb-6 flex items-center gap-3 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
          <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {product.current_highest_bidder.full_name?.charAt(0) || 'B'}
          </div>
          <div>
            <div className="text-xs text-yellow-700 uppercase font-bold mb-0.5">{product.auction_status === 'active' ? 'Người giữ giá cao nhất' : 'Người thắng đấu giá'}</div>
            <div className="font-bold text-gray-900">{maskName(product.current_highest_bidder.full_name)}</div>
            <div className="text-xs text-yellow-500 flex items-center">
               ⭐ {isNaN(calculateRatingRatio(product.current_highest_bidder.rating_score, product.current_highest_bidder.rating_count)) ? 'NaN' : calculateRatingRatio(product.current_highest_bidder.rating_score, product.current_highest_bidder.rating_count) + '%'}
               <span className="text-gray-400 ml-1">({product.current_highest_bidder.rating_count} đánh giá)</span>
            </div>
          </div>
        </div>
      )}
      <div className="border-t border-gray-100 pt-4 text-sm text-gray-600 space-y-2">
        <div className="flex justify-between"><span>Thời điểm đăng:</span><span className="font-medium text-gray-800">{formatDate(product.auction_start_time)}</span></div>
        <div className="flex justify-between"><span>Thời điểm kết thúc:</span><span className="font-medium text-gray-800">{formatDate(product.auction_end_time)}</span></div>
      </div>
      <LoginRequestModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} productName={product.product_name} />
    </div>
  )
}

function ProductDescription({ product, isRealSeller, onRefresh }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Xử lý dữ liệu history
  const history = product.description_history || [];
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  const handleSubmit = async () => {
    if (!newContent || newContent === '<p><br></p>') {
      alert('Vui lòng nhập nội dung!');
      return;
    }

    setIsSaving(true);
    try {
      await productService.appendDescription(product._id, newContent); 
      ToastNotification('Cập nhật mô tả thành công!', 'success');

      // Clear
      if (onRefresh) {
        await onRefresh(); 
      }
      setNewContent('');
      setIsEditing(false);
    } catch (error) {
      const message = error?.response?.data?.message || "Có lỗi xảy ra!";
      ToastNotification(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-12">
      {/* HEADER & BUTTON */}
      <div className="flex justify-between items-center mb-6 border-b-2 border-blue-600 pb-2">
        <h2 className="text-2xl font-bold text-gray-800">
          📝 Chi tiết & Cập nhật mô tả
        </h2>
        
        {isRealSeller && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Bổ sung thông tin
          </button>
        )}
      </div>

      {/* FORM EDITOR */}
      {isEditing && (
        <div className="mb-8 animate-fade-in-down">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Thêm thông tin bổ sung</h3>
            <div className="mb-4 border border-gray-300 rounded-lg bg-white">
              <TextEditor 
                value={newContent} 
                onChange={setNewContent}
                placeholder="Nhập thông tin bổ sung..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setIsEditing(false); setNewContent(''); }}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium cursor-pointer"
                disabled={isSaving}
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-md flex items-center gap-2 cursor-pointer"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu bổ sung'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIST DESCRIPTION */}
      <div className="flex flex-col border border-gray-300 rounded-sm bg-white shadow-sm">
        {sortedHistory.length > 0 ? (
          sortedHistory.map((item, index) => (
            <div 
              key={index} 
              className={`group ${index !== sortedHistory.length - 1 ? 'border-b border-gray-200' : ''}`}
            >
              {/* Header */}
              <div className={`px-5 py-3 flex justify-between items-center ${index === 0 ? 'bg-blue-100/50' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2">
                  {index === 0 && (
                    <span className="bg-blue-600 text-white text-sm uppercase font-bold px-2 py-0.5 rounded-sm tracking-wide">
                      Mới nhất
                    </span>
                  )}
                  <span className={`text-sm font-medium ${index === 0 ? 'text-blue-800' : 'text-gray-600'}`}>
                    {index === 0 ? 'Nội dung hiện tại' : 'Lịch sử cập nhật'}
                  </span>
                </div>
                <span className="text-sm text-gray-500 font-mono">
                  {formatDate(item.timestamp)}
                </span>
              </div>

              {/* Content */}
              <div className="p-6 bg-white">
                <div 
                  className="prose prose-sm max-w-none text-[#111827] text-base leading-relaxed prose-headings:font-semibold prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800 prose-img:rounded-sm"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-gray-50">
            <p className="text-gray-500 text-sm">Người bán chưa cung cấp mô tả chi tiết cho sản phẩm này.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// === Bidding Section ===
const BlockingMessage = ({ title, message, type = 'blue' }) => {
  const styles = {
    blue: "text-blue-800 bg-blue-50 border-blue-100",
    red: "text-red-800 bg-red-50 border-red-100",
    yellow: "text-yellow-800 bg-yellow-50 border-yellow-100",
    green: "text-green-800 bg-green-50 border-green-100",
  };
  
  return (
    <div className={`flex flex-col items-center gap-4 p-4 rounded-lg border ${styles[type] || styles.blue}`}>
       <h3 className="font-bold text-2xl text-center">{title}</h3>
       <p className="text-sm opacity-90 text-center">{message}</p>
    </div>
  );
};

const renderBiddingContent = (user, product, 
  isRealSeller, isBannedUser, isNewbie, 
  bidAmount, minValidPrice, setBidAmount, formatPrice,
  handleBidClick, handleBuyNowClick) => {
    // Trường hợp 1: Chưa đăng nhập
    if (!user) {
        return (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4 font-medium">Vui lòng đăng nhập để tham gia đấu giá sản phẩm này</p>
              <Link to="/login">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-md cursor-pointer">
                  Đăng nhập ngay
                </button>
              </Link>
            </div>
        );
    }

    // Trường hợp 2: Là Seller (Chủ hàng)
    if (isRealSeller) {
        return <BlockingMessage 
            title="Bạn là chủ sở hữu sản phẩm này" 
            message="Bạn không thể đặt giá. Hãy theo dõi lịch sử đấu giá để quản lý các lượt ra giá."
            type="blue" 
        />;
    }

    // Trường hợp 3: Bị cấm (Banned)
    if (isBannedUser) {
        return <BlockingMessage 
            title="Bạn đã bị chặn đấu giá" 
            message="Người bán đã từ chối quyền tham gia đấu giá của bạn đối với sản phẩm này."
            type="red" 
        />;
    }

    // Trường hợp 4: Là Newbie (và sản phẩm cấm Newbie)
    if (isNewbie) {
        return <BlockingMessage 
            title="Giới hạn người tham gia" 
            message="Sản phẩm này không cho phép tài khoản mới (chưa có đánh giá) tham gia đấu giá."
            type="yellow" 
        />;
    }

    // Trường hợp 5: Sản phẩm đã kết thúc đấu giá
    if (new Date(product.auction_end_time) <= new Date() || product.auction_status !== 'active') {
        return <BlockingMessage 
            title="Phiên đấu giá đã kết thúc" 
            message="Rất tiếc, phiên đấu giá cho sản phẩm này đã kết thúc. Vui lòng kiểm tra lịch sử đấu giá để biết thêm chi tiết."
            type="green" 
        />;
    }

    // Trường hợp 6: Hợp lệ -> Hiển thị Form đặt giá
    return (
        <div className="mb-4">
          <label className="block mb-2 font-bold text-gray-700">Giá đặt của bạn (₫)</label>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Phần Input nhập giá */}
            <div className="flex-1">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                min={minValidPrice}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium text-gray-900"
              />
              <div className="text-sm text-gray-500 mt-2 ml-1">
                Giá đặt tối thiểu: <span className="font-semibold text-gray-700">₫{formatPrice(minValidPrice)}</span>
              </div>
            </div>

            {/* Nút Đặt giá */}
            <button
              onClick={handleBidClick}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors active:scale-95 whitespace-nowrap h-[54px] cursor-pointer"
            >
              Đặt giá ngay
            </button>

            {/* Nút Mua ngay */}
            {product.buy_it_now_price && (
              <button
                onClick={handleBuyNowClick}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors active:scale-95 whitespace-nowrap h-[54px] cursor-pointer"
              >
                Mua ngay
              </button>
            )}
          </div>
        </div>
    );
};
// =======================

function BiddingSection({ product, minValidPrice, user, isRealSeller, isBannedUser, isNewbie, bidHistory, onRefresh }) {
  const [bidAmount, setBidAmount] = useState(minValidPrice || product.start_price)
  const [showHistory, setShowHistory] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showBidDialog, setShowBidDialog] = useState(false);
  const [showBuyNowDialog, setShowBuyNowDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [banTarget, setBanTarget] = useState(null);

  useEffect(() => {
    setBidAmount(minValidPrice > 0 ? minValidPrice : product.start_price);
  }, [minValidPrice, product.start_price]);

  // Ban user
  const handleBanUser = (bidderId, bidderName, is_banned) => {
      setBanTarget({ id: bidderId, name: bidderName, is_banned: is_banned });
      setShowBanDialog(true);
  };

  const executeBan = async () => {
    setShowBanDialog(false);

    if (!banTarget) return;

    try {
      if (banTarget.is_banned) {
        await productService.unbanBidder(product._id, banTarget.id);
      } else {
        await productService.banBidder(product._id, banTarget.id);
      }
      ToastNotification(`Đã cập nhật trạng thái cấm cho "${banTarget.name}"`, 'success');
      
      if(onRefresh) onRefresh(); 
    } catch (error) {
      const message = error?.response?.data?.message || "Có lỗi xảy ra!";
      ToastNotification(message, 'error');
    } finally {
        setBanTarget(null);
    }
  };

  const handleBid = async () => {
    if (!user) {
      setShowLoginModal(true);
      return
    }
    if (bidAmount < minValidPrice) {
      alert(`Giá đặt phải tối thiểu ₫${new Intl.NumberFormat('vi-VN').format(minValidPrice)}`)
      return
    }

    setShowBidDialog(true);
  }

  const executeBid = async () => {
    setShowBidDialog(false);
    
    try {
      await bidService.placeBid(product._id, bidAmount)
      const displayPrice = new Intl.NumberFormat('vi-VN').format(bidAmount);
      ToastNotification(`Đã đặt giá (₫${displayPrice}) thành công!`, 'success')
      
      if(onRefresh) onRefresh();
    } catch(err) {
      const message = err?.response?.data?.message || "Có lỗi xảy ra!";
      ToastNotification(message, 'error');
    }
  }

  const handleBuyNowClick = async () => {
    if (!user) {
      setShowLoginModal(true);
      return
    }

    setShowBuyNowDialog(true);
  }

  const executeBuyNow = async () => {
    setShowBuyNowDialog(false);
    
    try {
      await productService.buyProductNow(product._id)
      ToastNotification(`Mua ngay thành công! Vui lòng chờ liên hệ từ người bán.`, 'success')
      
      if(onRefresh) onRefresh();
    } catch(err) {
      const message = err?.response?.data?.message || "Có lỗi xảy ra!";
      ToastNotification(message, 'error');
    }
  }

  const formatDateTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return dateString; }
  };
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold pb-2 border-b-2 border-blue-600 inline-block text-gray-800">💰 Đặt giá & Lịch sử đấu giá</h2>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border border-blue-200 transition-colors cursor-pointer"
        >
          {showHistory ? 'Thu gọn lịch sử' : 'Xem lịch sử đấu giá'}
        </button>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
        {renderBiddingContent(
          user, product, isRealSeller, isBannedUser, isNewbie,
          bidAmount, minValidPrice, setBidAmount, formatPrice,
          handleBid, handleBuyNowClick
        )}
      </div>

      {showHistory && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">📜 Lịch sử đấu giá ({bidHistory.length} lượt)</h3>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {(bidHistory.length === 0) ? (
              <div className="text-center py-8 text-gray-500">Chưa có lượt đấu giá nào</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Thời điểm</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Người đấu giá</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Giá vào sản phẩm</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Người giữ giá</th>
                      {isRealSeller && product.auction_status === 'active' && <th className="py-3 px-4 text-center font-semibold text-gray-700 border-b">Kiểm duyệt</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {bidHistory.map((bid, index) => {
                      // Bidder
                      const invalidBidder = !bid.is_valid;
                      let bidderName = bid.user?.full_name; 
                      if (invalidBidder && !isRealSeller) bidderName = undefined;

                      // Holder
                      const invalidHolder = bid.invalid_holder;
                      let holderName = bid.holder?.full_name;
                      if (invalidHolder && !isRealSeller) holderName = undefined;

                      // Bid Price & Created At
                      const bidPrice = bid.price || bid.amount || 0;
                      const createdAt = bid.createdAt || bid.date || '';

                      return (
                        <tr key={bid._id || index} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="py-3 px-4 border-b"><div className="font-medium text-gray-900">{formatDateTime(createdAt)}</div></td>
                          <td className="py-3 px-4 border-b">
                            <div className="flex items-center gap-2">
                              {/* Avatar người dùng */}
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${invalidBidder ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                                {bidderName?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              {/* Tên người dùng */}
                              <span className={`font-medium text-sm leading-tight ${invalidBidder ? 'text-gray-400 line-through italic' : 'text-gray-800'}`}>
                                {bidderName ? maskName(bidderName) : 'Ẩn Danh'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 border-b"><div className="font-bold text-red-600 text-lg">₫{formatPrice(bidPrice)}</div></td>
                          <td className="py-3 px-4 border-b">
                             <div className="flex items-center gap-2">
                              {/* Avatar người dùng */}
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${invalidHolder ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-indigo-600'}`}>
                                {holderName?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              {/* Tên người dùng */}
                              <span className={`font-medium text-sm leading-tight ${invalidHolder ? 'text-gray-400 line-through italic' : 'text-gray-800'}`}>
                                {holderName ? maskName(holderName) : 'Ẩn Danh'}
                              </span>
                            </div>
                          </td>
                          {isRealSeller && product.auction_status === 'active' && (
                               <td className="py-3 px-4 border-b text-center">
                                   <button 
                                        onClick={() => handleBanUser(bid.user._id, bidderName, bid.is_banned)}
                                        className={`${bid.is_banned ? 'bg-green-100 hover:bg-green-200 text-green-700' : 'bg-red-100 hover:bg-red-200 text-red-700'} p-2 rounded-lg transition-colors text-sm font-bold flex items-center gap-1 mx-auto cursor-pointer`}
                                        title="Kiểm duyệt người duyệt"
                                   >
                                      {bid.is_banned ? 'Mở lại' : 'Từ chối'}
                                   </button>
                               </td>
                           )}
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
      {/* CÁC MODAL */}
      <LoginRequestModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {showBidDialog && (
        <ConfirmDialog 
          message={`Bạn có chắc chắn muốn đặt giá ₫${formatPrice(bidAmount)} cho sản phẩm này không?`}
          onYes={executeBid}
          onNo={() => setShowBidDialog(false)}
        />
      )}

      {showBuyNowDialog && (
        <ConfirmDialog 
          message={`Bạn có chắc chắn muốn MUA NGAY sản phẩm này với giá ₫${formatPrice(product.buy_it_now_price)} không?`}
          onYes={executeBuyNow}
          onNo={() => setShowBuyNowDialog(false)}
        />
      )}

      {showBanDialog && banTarget && (
        <ConfirmDialog 
          message={`XÁC NHẬN: Bạn có chắc chắn muốn ${banTarget.is_banned ? 'MỞ KHÓA' : 'CẤM'} người dùng "${banTarget.name}" tham gia đấu giá sản phẩm này?`}
          onYes={executeBan}
          onNo={() => { setShowBanDialog(false); setBanTarget(null); }}
        />
      )}
    </div>
  );
}

function ProductQA({ product, user, isRealSeller, questions = [], onRefresh }) {
  const [questionText, setQuestionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Phần trả lời của Seller
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);

  // Bidder đặt câu hỏi
  const handlePostQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    setIsSubmitting(true);
    try {
      await productService.postQuestion(product._id, questionText);
      setQuestionText('');
      onRefresh();
    } catch (error) {
      const message = error?.response?.data?.message || "Có lỗi xảy ra!";
      ToastNotification(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Seller trả lời câu hỏi
  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsReplySubmitting(true);
    try {
      await productService.postAnswer(replyingToId, replyText);
      setReplyingToId(null);
      setReplyText('');
      onRefresh();
    } catch (error) {
      const message = error?.response?.data?.message || "Có lỗi xảy ra!";
      ToastNotification(message, 'error');
    } finally {
      setIsReplySubmitting(false);
    }
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-blue-600 inline-block text-gray-800">
        ❓ Hỏi & Đáp
      </h2>
      <div className="bg-white p-10 text-center rounded-xl border border-gray-200 text-gray-500 italic">
        {/* LOGIC NHẬP CÂU HỎI: Chỉ hiện khi là User thường (Bidder), ko phải Seller, ko phải Guest */}
        {!isRealSeller && user ? (
          <form onSubmit={handlePostQuestion} className="mb-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1">
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Đặt câu hỏi cho người bán..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] resize-none"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !questionText.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi câu hỏi'}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : !user ? (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
            Vui lòng <span className="font-semibold text-blue-600 cursor-pointer">đăng nhập</span> để đặt câu hỏi.
          </div>
        ) : null}

        {/* DANH SÁCH CÂU HỎI */}
        <div className="space-y-6">
          {questions.length === 0 ? (
            <p className="text-center text-gray-500 italic py-4">Chưa có câu hỏi nào.</p>
          ) : (
            questions.map((q) => (
              <div key={q._id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                {/* === PHẦN CÂU HỎI === */}
                <div className="flex gap-3 items-start">
                  {/* Avatar Người hỏi */}
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold flex-shrink-0 border border-gray-300">
                    {q.asker?.full_name ? q.asker.full_name.charAt(0).toUpperCase() : '?'}
                  </div>

                  {/* Bong bóng nội dung câu hỏi */}
                  <div className="flex-1 bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-gray-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-900 text-sm">
                          {q.asker?.full_name || 'Người dùng ẩn danh'}
                      </span>
                      <span className="text-xs text-gray-400">
                          {new Date(q.question_timestamp).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-sm text-left">
                      {q.question_content}
                    </p>
                  </div>
                </div>

                {/* Câu trả lời (Nếu có) */}
                {q.answer_content ? (
                  <div className="mt-4 ml-11 flex gap-3 rounded-lg">
                    {/* Avatar Người trả lời */}
                    <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-gray-600 font-bold flex-shrink-0 border border-gray-300">
                      {q.answerer?.full_name ? q.answerer.full_name.charAt(0).toUpperCase() : '?'}
                    </div>

                    {/* Bong bóng nội dung câu trả lời */}
                    <div className="flex-1 bg-blue-50 p-4 rounded-2xl rounded-tl-none border border-blue-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-blue-900 text-sm">
                            {q.answerer?.full_name || 'Người dùng ẩn danh'}
                        </span>
                        <span className="text-xs text-blue-400">
                            {new Date(q.answer_timestamp).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-blue-700 leading-relaxed text-sm text-left">
                        {q.answer_content}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* LOGIC SELLER TRẢ LỜI: Chỉ hiện khi là Seller và chưa có câu trả lời */
                  isRealSeller && (
                    <div className="mt-3 ml-11">
                      {replyingToId === q._id ? (
                        <div className="animate-fade-in">
                          <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Nhập câu trả lời..."
                              className="w-full p-2 text-sm border border-blue-200 rounded-lg focus:ring-1 focus:ring-blue-500 mb-2"
                              rows="2"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button 
                                  onClick={handleSubmitReply}
                                  disabled={isReplySubmitting || !replyText.trim()}
                                  className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 cursor-pointer flex items-center gap-1"
                              >
                                {isReplySubmitting ? 'Đang gửi...' : 'Gửi câu trả lời'}
                              </button>
                              <button 
                                  onClick={() => { setReplyingToId(null); setReplyText(''); }}
                                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 cursor-pointer flex items-center gap-1"
                              >
                                Huỷ
                              </button>
                            </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingToId(q._id)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          Trả lời câu hỏi này
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function RelatedProducts({ products, loading = false }) {
  if (loading) return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-blue-600 inline-block text-gray-800">🔄 Sản phẩm cùng chuyên mục</h2>
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

  if (!products?.length) return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-blue-600 inline-block text-gray-800">🔄 Sản phẩm cùng chuyên mục</h2>
        <div className="text-center py-8 text-gray-500 italic">Chưa có sản phẩm nào cùng chuyên mục</div>
      </div>
  );

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-blue-600 inline-block text-gray-800">🔄 Sản phẩm cùng chuyên mục ({products.length} sản phẩm)</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}