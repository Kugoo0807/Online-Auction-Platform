import { Routes, Route } from 'react-router-dom'
import './App.css'
import MainLayout from './components/layout/MainLayout'

// Pages
import HomePages from './pages/HomePages'
import Login from './pages/Login'
import SignUp from './pages/SignUp' 
import Dashboard from './pages/Dashboard'
import AuctionDetail from './pages/AuctionDetail'
import OAuthCallback from './pages/OAuthCallback'
import CategoryPage from './pages/CategoryPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SearchPage from './pages/SearchPage'; // Trang tìm kiếm

// Components
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route path="/" element={<HomePages />} />
        <Route path="/auction/:id" element={<AuctionDetail />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        
        {/* Guest only */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Private */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Route>
    </Routes>
  )
}