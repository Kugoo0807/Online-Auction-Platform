// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import './App.css'
import MainLayout from './components/layout/MainLayout'

// Import các trang
import HomePages from './pages/HomePages'
import Login from './pages/Login'
import Signup from './pages/Signup' // Lưu ý tên file bạn đặt là SignUp hay Signup nhé
import Dashboard from './pages/Dashboard'
import AuctionDetail from './pages/AuctionDetail'
import OAuthCallback from './pages/OAuthCallback'
import CategoryPage from './pages/CategoryPage';
// Import các Route bảo vệ (nếu bạn đã tạo file component này rồi)
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        
        {/* 1. Các trang Public (Ai cũng vào được) */}
        <Route path="/" element={<HomePages />} />
        <Route path="/auction/:id" element={<AuctionDetail />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        
        
        {/* 2. Các trang Khách (Đã đăng nhập thì không vào được nữa) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* 3. Các trang Private (Phải đăng nhập mới vào được) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/create-auction" element={<CreateAuction />} /> */}
        </Route>

      </Route>
    </Routes>
  )
}