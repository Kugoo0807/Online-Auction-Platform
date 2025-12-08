import { useState, useEffect } from 'react';
import UpgradeRequestsTab from '../components/admin/UpgradeRequests';
import UserManagementTab from '../components/admin/UserManagement';
import ProductManagementTab from '../components/admin/ProductManagement'; // Import mới
import CategoryManagementTab from '../components/admin/CategoryManagement'; // Import mới

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('upgrade-requests');

  useEffect(() => {
     window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const tabs = [
    { id: 'upgrade-requests', label: 'Yêu cầu nâng cấp' },
    { id: 'users', label: 'Quản lý người dùng' },
    { id: 'products', label: 'Sản phẩm' },
    { id: 'categories', label: 'Danh mục' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex bg-gray-100/80 p-1 rounded-xl w-fit border border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in zoom-in duration-300">
        {activeTab === 'upgrade-requests' && <UpgradeRequestsTab />}
        {activeTab === 'users' && <UserManagementTab />}
        {activeTab === 'products' && <ProductManagementTab />}
        {activeTab === 'categories' && <CategoryManagementTab />}
      </div>
    </div>
  );
}