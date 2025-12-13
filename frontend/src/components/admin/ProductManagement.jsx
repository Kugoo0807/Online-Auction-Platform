import { useState, useEffect } from 'react';
import { productService } from '../../services/product.service';
import { useDelayedAction } from '../../hooks/useDelayedAction';
import { Trash2, Undo2, Eye, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ToastNotification from '../common/ToastNotification';

export default function ProductManagementTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    productService.getAllProducts()
      .then(response => {
        const productList = response.data || [];
        setProducts(productList);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFakeDelete = async (id) => {
    console.log(`Đã xóa sản phẩm ID: ${id}`);
    setProducts(prev => prev.filter(p => p._id !== id));
    ToastNotification('Đã xóa sản phẩm', 'success');
  };

  const { pendingIds, triggerAction, cancelAction } = useDelayedAction(handleFakeDelete);

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        icon: Clock,
        label: 'Đang diễn ra',
        bgFull: 'bg-blue-100'
      },
      sold: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        icon: CheckCircle,
        label: 'Đã bán',
        bgFull: 'bg-green-100'
      },
      ended: {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-600',
        icon: AlertCircle,
        label: 'Kết thúc',
        bgFull: 'bg-gray-100'
      },
      cancelled: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        icon: XCircle,
        label: 'Đã hủy',
        bgFull: 'bg-red-100'
      }
    };

    const config = statusConfig[status] || statusConfig.ended;
    const Icon = config.icon;

    return (
      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 w-fit ${config.bgFull} ${config.border} ${config.text}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
       <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Quản lý sản phẩm</h3>
      </div>
      {loading && (
        <div className="p-6 text-center text-gray-500">
          Đang tải dữ liệu...
        </div>
      )}
      {!loading && products.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          Không có sản phẩm nào
        </div>
      )}
      {!loading && products.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Tên sản phẩm</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4">Giá hiện tại</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => {
                 const isPending = pendingIds.has(product._id);
                 return (
                  <tr key={product._id} className={`transition-all ${isPending ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                    <td className={`px-6 py-4 font-medium text-gray-900 max-w-[200px] truncate ${isPending ? 'opacity-50' : ''}`}>{product.product_name}</td>
                    <td className={`px-6 py-4 text-gray-600 ${isPending ? 'opacity-50' : ''}`}>{product.category?.category_name || 'Chưa phân loại'}</td>
                    <td className={`px-6 py-4 font-bold text-gray-800 ${isPending ? 'opacity-50' : ''}`}>
                      {new Intl.NumberFormat('vi-VN').format(product.current_highest_price)}₫
                    </td>
                    <td className={`px-6 py-4 ${isPending ? 'opacity-50' : ''}`}>{getStatusBadge(product.auction_status)}</td>
                    <td className="px-6 py-4 text-right">
                      {isPending ? (
                         <button onClick={() => cancelAction(product._id)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-white rounded-md text-xs font-bold">
                           <Undo2 className="w-3 h-3" /> Undo (5s)
                         </button>
                      ) : (
                        <div className="flex justify-end gap-2">
                           <Link to={`/product/${product._id}`} target="_blank" className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                              <Eye className="w-4 h-4" />
                           </Link>
                           <button onClick={() => triggerAction(product._id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      )}
                    </td>
                  </tr>
                 )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}