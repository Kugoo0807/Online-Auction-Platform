import React from 'react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusBadge = (status) => {
  const statusConfig = {
    active: { label: 'Đang đấu giá', color: 'bg-green-500' },
    ended: { label: 'Đã kết thúc', color: 'bg-gray-500' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-500' },
    sold: { label: 'Đã bán', color: 'bg-blue-500' }
  };
  const config = statusConfig[status] || { label: status, color: 'bg-gray-400' };
  return (
    <span className={`${config.color} text-white text-xs font-semibold px-3 py-1 rounded-full uppercase`}>
      {config.label}
    </span>
  );
};

export function SellerProductCard({ product, onAppendDescription, onRelistProduct, onViewDetail }) {
  const status = product.auction_status;
  const imageUrl = product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image';
  const currentPrice = product.current_highest_price || product.start_price || 0;
  const productName = product.product_name || product.name || 'Sản phẩm';
  const endTime = product.auction_end_time || product.end_time;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-gray-100">
        <img 
          src={imageUrl} 
          alt={productName}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          {getStatusBadge(status)}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
          {productName}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Giá hiện tại</span>
            <span className="font-bold text-green-600">{formatCurrency(currentPrice)}</span>
          </div>
          
          {status === 'active' && endTime && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Kết thúc</span>
              <span className="text-sm text-gray-700">{formatDate(endTime)}</span>
            </div>
          )}

          {status === 'sold' && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span className="text-sm font-semibold text-blue-900">Đã bán thành công</span>
              </div>
              <p className="text-xs text-blue-700">Giá bán: {formatCurrency(product.final_price || currentPrice)}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {status === 'active' && (
            <div className="flex gap-2">
              <button
                onClick={() => onAppendDescription(product)}
                className="flex-1 bg-black hover:bg-gray-800 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Bổ sung mô tả
              </button>
              <button
                onClick={() => onViewDetail(product)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                Xem chi tiết
              </button>
            </div>
          )}

          {status === 'ended' && (
            <div className="flex gap-2">
              <button
                onClick={() => onRelistProduct(product)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                Bán lại
              </button>
              <button
                onClick={() => onViewDetail(product)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                Xem chi tiết
              </button>
            </div>
          )}

          {status === 'cancelled' && (
            <div className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 text-center">Sản phẩm đã bị hủy</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SellerProductGrid({ 
  products, 
  onAppendDescription, 
  onRelistProduct, 
  onViewDetail,
  emptyMessage = "Không có sản phẩm nào ở trạng thái này."
}) {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có sản phẩm nào</h3>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => (
        <SellerProductCard 
          key={product._id || product.id} 
          product={product}
          onAppendDescription={onAppendDescription}
          onRelistProduct={onRelistProduct}
          onViewDetail={onViewDetail}
        />
      ))}
    </div>
  );
}
