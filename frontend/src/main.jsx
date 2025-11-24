// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import AuctionDetail from './pages/AuctionDetail'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard' // Import Dashboard
import ProtectedRoute from './components/ProtectedRoute.jsx'
import GuestRoute from './components/GuestRoute.jsx' // Import GuestRoute
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'
import OAuthCallback from './pages/OAuthCallback'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* --- PUBLIC ROUTES (Ai cũng vào được) --- */}
          <Route path="/" element={<App />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />

          {/* --- AUTH ROUTES (Chỉ khách mới vào được: Login, Register) --- */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>

          {/* --- PROTECTED ROUTES (Phải đăng nhập mới vào được) --- */}
          <Route element={<ProtectedRoute />}>
             <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/auction/:id" element={<AuctionDetail />} />
             {/* Ví dụ route chỉ cho Seller: 
                 <Route path="/create-auction" element={
                    <ProtectedRoute allowedRoles={['seller', 'admin']}>
                        <CreateAuction />
                    </ProtectedRoute>
                 } /> 
             */}
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
