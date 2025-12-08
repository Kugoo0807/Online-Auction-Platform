import { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import { useDelayedAction } from '../../hooks/useDelayedAction';
import { Trash2, Undo2 } from 'lucide-react';
import ToastNotification from '../common/ToastNotification';

export default function CategoryManagementTab() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryService.getAllCategories().then(res => {
        setCategories(res.data || []);
    });
  }, []);

  const handleFakeDelete = async (id) => {
    console.log(`[Mock] Đã xóa danh mục ID: ${id}`);
    setCategories(prev => prev.filter(c => c._id !== id));
    ToastNotification('Đã xóa danh mục (Mock)', 'success');
  };

  const { pendingIds, triggerAction, cancelAction } = useDelayedAction(handleFakeDelete);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
       <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Quản lý danh mục</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Tên danh mục</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Danh mục cha</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => {
              const isPending = pendingIds.has(cat._id);
              return (
                <tr key={cat._id} className={`transition-all ${isPending ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                  <td className={`px-6 py-4 font-bold text-gray-800 ${isPending ? 'opacity-50' : ''}`}>{cat.category_name}</td>
                  <td className={`px-6 py-4 text-blue-600 font-mono text-xs ${isPending ? 'opacity-50' : ''}`}>{cat.slug}</td>
                  <td className={`px-6 py-4 text-gray-500 ${isPending ? 'opacity-50' : ''}`}>
                      {cat.parent ? cat.parent.category_name : '-- Gốc --'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isPending ? (
                       <button onClick={() => cancelAction(cat._id)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-white rounded-md text-xs font-bold">
                         <Undo2 className="w-3 h-3" /> Undo (5s)
                       </button>
                    ) : (
                       <button onClick={() => triggerAction(cat._id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}