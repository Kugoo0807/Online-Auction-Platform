import { useState, useEffect } from 'react';
import { upgradeRequestService } from '../../services/upgradeRequestService';
import { useDelayedAction } from '../../hooks/useDelayedAction';
import ToastNotification from '../common/ToastNotification';
import { Check, X, Undo2 } from 'lucide-react';

export default function UpgradeRequestsTab() {
  const [requests, setRequests] = useState([]);

  const fetchData = async () => {
    try {
      const res = await upgradeRequestService.getPendingList();
      setRequests(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Hàm thực thi API
  const executeDecision = async (id, status) => {
    try {
        await upgradeRequestService.updateRequestStatus(id, { status });
        ToastNotification(status === 'approved' ? 'Đã duyệt yêu cầu' : 'Đã từ chối yêu cầu', 'success');
        fetchData();
    } catch(err) {
        ToastNotification('Lỗi khi xử lý', 'error');
    }
  };

  const { pendingIds, triggerAction, cancelAction } = useDelayedAction(executeDecision);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Yêu cầu nâng cấp</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Tên người dùng</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Ngày yêu cầu</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-gray-500">Không có yêu cầu nào</td></tr>}
            {requests.map((req) => {
              const isPending = pendingIds.has(req._id);
              return (
                <tr key={req._id} className={`transition-all ${isPending ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
                  <td className={`px-6 py-4 font-medium ${isPending ? 'opacity-50' : ''}`}>{req.bidder?.full_name}</td>
                  <td className={`px-6 py-4 text-gray-600 ${isPending ? 'opacity-50' : ''}`}>{req.bidder?.email}</td>
                  <td className={`px-6 py-4 text-gray-500 ${isPending ? 'opacity-50' : ''}`}>{new Date(req.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4 text-right">
                    {isPending ? (
                       <button onClick={() => cancelAction(req._id)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-white rounded-md text-xs font-bold">
                         <Undo2 className="w-3 h-3" /> Undo (5s)
                       </button>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => triggerAction(req._id, 'approved')}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-1"
                        >
                            <Check className="w-3 h-3" /> Duyệt
                        </button>
                        <button 
                            onClick={() => triggerAction(req._id, 'rejected')}
                            className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded flex items-center gap-1"
                        >
                             <X className="w-3 h-3" /> Từ chối
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
    </div>
  );
}