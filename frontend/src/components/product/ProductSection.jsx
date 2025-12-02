import { Link } from 'react-router-dom';

// Utility functions
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price);
};

const getTimeRemaining = (endTime) => {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end - now;
  
  if (diff <= 0) return 'Đã kết thúc';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days} ngày ${hours} giờ`;
  } else if (hours > 0) {
    return `${hours} giờ ${minutes} phút`;
  } else {
    return `${minutes} phút`;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

export default function ProductSection({ title, products, loading = false }) {
  if (loading) {
    return (
      <div className="my-10">
        <h2 className="bg-blue-600 text-white w-fit rounded-full px-4 py-2 mb-5 font-bold shadow-md">
          🏷️ {title}
        </h2>
        <div className="text-center py-10 text-gray-500 italic">
          Đang tải sản phẩm...
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="my-10">
        <h2 className="bg-blue-600 text-white w-fit rounded-full px-4 py-2 mb-5 font-bold shadow-md">
          🏷️ {title}
        </h2>
        <div className="text-center py-10 text-gray-500 italic">
          Không có sản phẩm nào
        </div>
      </div>
    );
  }

  return (
    <div className="my-10">
      {/* Tiêu đề section */}
      <h2 className="bg-blue-600 text-white w-fit rounded-full px-4 py-2 mb-5 font-bold shadow-md">
        🏷️ {title}
      </h2>

      {/* Vùng chứa các card - Sử dụng Grid để responsive tốt hơn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}

const THIRTY_MINUTES_MS = 30 * 60 * 1000;

// Component thẻ sản phẩm
export function ProductCard({ product }) {
  const now = Date.now();
  const startTime = new Date(product.auction_start_time).getTime();
  const timeSinceStart = now - startTime;
  if (timeSinceStart >= 0 && timeSinceStart <= THIRTY_MINUTES_MS) {
    return (
      <div
        // 1. Container
        className="group relative bg-white border-2 border-orange-500 rounded-xl p-3 text-center shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] flex flex-col h-[500px]"
      >
        {/* 2. Badge */}
        <div className="absolute top-0 right-0 z-10 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg shadow-sm animate-pulse">
          MỚI ĐĂNG
        </div>

        <div className="relative overflow-hidden rounded-lg h-[200px]">
             <img
              src={product.thumbnail}
              alt={product.product_name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.target.src = "/images/placeholder.jpg";
              }}
            />
        </div>

        <div className="flex flex-col flex-1 pt-3">
          <h3 className="text-orange-900 text-lg font-bold mb-2 line-clamp-2 min-h-14 group-hover:text-orange-600 transition-colors">
            {product.product_name}
          </h3>

          {/* Thông tin sản phẩm */}
          <ProductInfo product={product} />

          <div className="mt-auto pt-2">
            <Link
              to={`/auction/${product._id}`}
              className="block w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all duration-200 transform hover:scale-[1.02]"
            >
              Xem ngay
            </Link>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div 
        className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-md transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-xl flex flex-col h-[500px]"
      >
        <img
          src={product.thumbnail}
          alt={product.product_name}
          className="w-full h-[200px] object-cover rounded-lg"
          onError={(e) => {
            e.target.src = '/images/placeholder.jpg'; // Fallback image
          }}
        />
        
        <div className="flex flex-col flex-1 pt-3">
          <h3 className="text-gray-900 text-lg font-semibold mb-2 line-clamp-2 min-h-14">
            {product.product_name}
          </h3>
          
          {/* Thông tin sản phẩm */}
          <ProductInfo product={product} />
          
          <div className="mt-auto pt-2">
            <Link
              to={`/auction/${product._id}`}
              className="block w-full bg-blue-400 hover:bg-blue-600 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all duration-200 transform hover:scale-[1.02]"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

// Component hiển thị thông tin sản phẩm
function ProductInfo({ product }) {
  // 1. Logic tính toán trạng thái
  const timeLeft = getTimeRemaining(product.auction_end_time);

  const now = Date.now();
  const startTime = new Date(product.auction_start_time || product.createdAt).getTime();
  const isNew = (now - startTime) <= THIRTY_MINUTES_MS;

  return (
    <div className="text-gray-600 text-sm text-left leading-relaxed space-y-1">
      {/* Giá hiện tại */}
      <div className="flex">
        <span className="min-w-[100px] font-bold text-gray-700">📌 Giá hiện tại:</span>
        <span className="font-medium text-gray-900">
          &nbsp;{formatPrice(product.current_highest_price || product.start_price)}₫
        </span>
      </div>

      {/* Người bán */}
      <div className="flex">
        <span className="min-w-[100px] font-bold text-gray-700">👤 Người bán:</span>
        <span className="truncate">{product.seller?.full_name || "Ẩn danh"}</span>
      </div>

      {/* Giá mua ngay */}
      {product.buy_it_now_price && product.buy_it_now_price > 0 && (
        <div className="flex">
          <span className="min-w-[100px] font-bold text-gray-700">💰 Mua ngay:</span>
          <span className={`${isNew ? 'text-orange-700 font-bold' : 'text-blue-600 font-bold'}`}>
            &nbsp;{formatPrice(product.buy_it_now_price)}₫
          </span>
        </div>
      )}

      {/* --- NGÀY ĐĂNG --- */}
      <div className="flex">
        <span className="min-w-[100px] font-bold text-gray-700">📅 Ngày đăng:</span>
        <span className={`${isNew ? 'text-orange-700 font-bold' : 'text-blue-600 font-bold'}`}>
          &nbsp;{formatDate(product.auction_start_time || product.createdAt)}
        </span>
      </div>

      {/* Thời gian còn lại */}
      <div className="flex">
        <span className="min-w-[100px] font-bold text-gray-700">⏳ Còn lại:</span>
        <span className={`${isNew ? 'text-orange-700 font-bold' : 'text-blue-600 font-bold'}`}>
          {timeLeft}
        </span>
      </div>

      {/* Số lượt ra giá */}
      <div className="flex">
        <span className="min-w-[100px] font-bold text-gray-700">🔁 Lượt ra giá:</span>
        <span>&nbsp;{product.bid_count || 0}</span>
      </div>
    </div>
  );
}