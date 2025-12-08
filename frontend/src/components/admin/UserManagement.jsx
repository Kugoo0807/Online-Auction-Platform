import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { useDelayedAction } from '../../hooks/useDelayedAction';
import ToastNotification from '../common/ToastNotification';
import { Trash2, RotateCcw, Undo2 } from 'lucide-react';

export default function UserManagementTab() {
  const [users, setUsers] = useState([]);
  const [viewDeleted, setViewDeleted] = useState(false);

  // 1. Fetch Data
  const fetchData = async () => {
    try {
      const res = viewDeleted 
        ? await userService.getDeletedUsers() 
        : await userService.getAllUsers();
      setUsers(res.users || []);
    } catch (error) {
      console.error("Lỗi tải user:", error);
    }
  };

  useEffect(() => { fetchData(); }, [viewDeleted]);

  // Logic Xóa/Khôi phục với Delay
  const handleExecuteAction = async (id) => {
    try {
      if (viewDeleted) {
        await userService.restoreUser(id);
        ToastNotification("Đã khôi phục người dùng", "success");
      } else {
        await userService.deleteUser(id);
        ToastNotification("Đã xóa người dùng", "success");
      }
      fetchData(); // Refresh data sau khi xong
    } catch (error) {
      ToastNotification(error.response?.data?.message || "Có lỗi xảy ra", "error");
    }
  };

  const { pendingIds, triggerAction, cancelAction } = useDelayedAction(handleExecuteAction);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">
          {viewDeleted ? 'Thùng rác (Người dùng đã xóa)' : 'Danh sách người dùng'}
        </h3>
        <button 
          onClick={() => setViewDeleted(!viewDeleted)}
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          {viewDeleted ? '← Quay lại danh sách chính' : 'Xem thùng rác'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Họ tên</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Vai trò</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => {
              const isPending = pendingIds.has(user._id);

              return (
                <tr key={user._id} className={`transition-all duration-300 ${isPending ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                  <td className={`px-6 py-4 font-medium text-gray-900 ${isPending ? 'opacity-50' : ''}`}>{user.full_name}</td>
                  <td className={`px-6 py-4 text-gray-600 ${isPending ? 'opacity-50' : ''}`}>{user.email}</td>
                  <td className={`px-6 py-4 ${isPending ? 'opacity-50' : ''}`}>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      user.role === 'seller' ? 'bg-blue-100 text-blue-700' : 
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isPending ? (
                      <button 
                        onClick={() => cancelAction(user._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-white rounded-md text-xs font-bold hover:bg-gray-700"
                      >
                        <Undo2 className="w-3 h-3" /> Hoàn tác (5s)
                      </button>
                    ) : (
                      <button 
                        onClick={() => triggerAction(user._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          viewDeleted 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={viewDeleted ? "Khôi phục" : "Xóa người dùng"}
                      >
                        {viewDeleted ? <RotateCcw className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}