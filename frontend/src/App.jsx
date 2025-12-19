import { Routes, Route } from 'react-router-dom'
import './App.css'
import MainLayout from './components/layout/MainLayout'

// Pages
import NotFound from './pages/NotFound'
import HomePages from './pages/HomePages'
import Login from './pages/Login'
import SignUp from './pages/SignUp' 
import Dashboard from './pages/Dashboard'
import AuctionDetail from './pages/AuctionDetail'
import OAuthCallback from './pages/OAuthCallback'
import CategoryPage from './pages/CategoryPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SearchPage from './pages/SearchPage';
import ProductDetail from './pages/ProductDetail';
import UserProfile from './pages/UserProfile'
import WatchList from './pages/WatchList';
import AdminDashboard from './pages/AdminDashboard'
import CreateProduct from './pages/CreateProduct'
import MyProducts from './pages/MyProducts'
import Order from './pages/Order'
import Ratings from "./pages/Ratings"
import BiddingProducts from './pages/BiddingProducts'
import WonProducts from './pages/WonProducts'
import { useAuth } from './context/AuthContext'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'
import SellerRoute from './components/SellerRoute'

function RoleDashboard() {
  const { user } = useAuth();
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  
  return <NotFound />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route path="/" element={<HomePages />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        
        {/* Guest only */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Private */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<RoleDashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/watch-list" element={<WatchList />} />
          <Route path="/auctions/won" element={<WonProducts />} />
          <Route path="/manage-products" element={<MyProducts />} />
          <Route path="/orders/:orderId" element={<Order />} />
          <Route path="/profile/ratings" element={<Ratings />} />
          <Route path="/auctions/bidding" element={<BiddingProducts />} />
        </Route>

        {/* Seller Only */}
        <Route element={<SellerRoute />}>
          <Route path="/product/create" element={<CreateProduct />} />
        </Route>

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}