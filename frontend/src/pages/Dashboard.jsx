import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { auctionService } from '../services/auctionService'
import ProductSection from '../components/product/ProductSection'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [myAuctions, setMyAuctions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMyAuctions = async () => {
      try {
        if (user?._id) {
          const data = await auctionService.getAuctions({ user: user._id })
          setMyAuctions(data)
        }
      } catch (error) {
        console.error('Error fetching my auctions:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchMyAuctions()
    }
  }, [user])

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h1>Xin chào, {user?.full_name}!</h1>
          <p>Email: {user?.email}</p>
          <p> Role: <strong>{user?.role}</strong></p>
        </div>
        <div>
          <Link to="/create-auction" style={{ marginRight: '10px' }}>
            <button>Tạo đấu giá mới</button>
          </Link>
          <button onClick={logout}>Đăng xuất</button>
        </div>
      </header>

      <section style={{ marginBottom: '40px' }}>
        <h2>Đấu giá của tôi</h2>
        {loading ? (
          <div>Loading...</div>
        ) : myAuctions.length > 0 ? (
          <ProductSection 
            title=""
            products={myAuctions}
          />
        ) : (
          <p>Bạn chưa có đấu giá nào. <Link to="/create-auction">Tạo đấu giá đầu tiên!</Link></p>
        )}
      </section>

      {/* các section đấu giá khác */}
      <ProductSection
        title="Top 5 sản phẩm gần kết thúc"
        products={[]} // sẽ được cập nhật từ API
      />
    </div>
  )
}