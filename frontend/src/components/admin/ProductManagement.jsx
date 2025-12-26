import { useState, useEffect } from 'react';
import { productService } from '../../services/product.service';
import ToastNotification from '../common/ToastNotification';
import ConfirmDialog from '../common/ConfirmDialog';
import LoadingIndicator from '../common/LoadingIndicator';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: '',
    onConfirm: null
  });

  const fetchData = async () => {
    try {
      // Lấy tất cả sản phẩm (cần endpoint admin trả về list all, hoặc dùng getProducts chung)
      // Giả sử getProducts public trả về active, nếu cần admin list all status thì backend cần hỗ trợ
      // Tạm thời dùng getProducts với limit lớn hoặc logic admin
      const res = await productService.getProducts({ limit: 100 }); 
      setProducts(res.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch products error:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCancelAuction = (product) => {
    setConfirmDialog({
      isOpen: true,
      message: `Bạn có chắc chắn muốn HỦY buổi đấu giá sản phẩm "${product.product_name}"? Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          await productService.cancelProduct(product._id);
          ToastNotification('Đã hủy đấu giá sản phẩm thành công', 'success');
          fetchData();
        } catch(error) {
            const message = error?.response?.data?.message || "Có lỗi xảy ra!";
            ToastNotification(message, 'error');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Helper format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading && products.length === 0) return <LoadingIndicator />;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Quản lý Sản phẩm</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 border-b">Sản phẩm</th>
              <th className="p-4 border-b">Người bán</th>
              <th className="p-4 border-b">Giá hiện tại</th>
              <th className="p-4 border-b">Trạng thái</th>
              <th className="p-4 border-b text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="p-4">
                    <div className="flex items-center gap-3">
                        <img src={product.thumbnail} alt="" className="w-10 h-10 object-cover rounded border border-gray-200"/>
                        <div>
                            <p className="font-medium text-gray-900 line-clamp-1 max-w-[200px]">{product.product_name}</p>
                            <p className="text-xs text-gray-500">ID: {product._id}</p>
                        </div>
                    </div>
                </td>
                <td className="p-4 text-gray-600">
                    {product.seller?.full_name || 'Unknown'}
                </td>
                <td className="p-4 font-medium text-gray-900">
                    {formatCurrency(product.current_highest_price || product.start_price)}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${product.auction_status === 'active' ? 'bg-green-100 text-green-800' : ''}
                    ${product.auction_status === 'ended' ? 'bg-gray-100 text-gray-800' : ''}
                    ${product.auction_status === 'failed' || product.auction_status === 'canceled' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {product.auction_status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {product.auction_status === 'active' && (
                    <button 
                      onClick={() => handleCancelAuction(product)}
                      className="text-red-600 hover:text-red-800 font-medium px-3 py-1.5 border border-red-200 hover:bg-red-50 rounded transition"
                    >
                      Hủy đấu giá
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmDialog.isOpen && (
        <ConfirmDialog 
          message={confirmDialog.message}
          onYes={confirmDialog.onConfirm}
          onNo={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
}