import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { products } from '../data/products'

export default function AuctionDetail() {
  const { id } = useParams()
  const product = products.find(p => p.id === parseInt(id))
  const [bid, setBid] = useState(product.price)
  const [message, setMessage] = useState('')

  const handleBid = () => {
    if (bid <= product.price) {
      setMessage('⚠️ Giá phải cao hơn giá hiện tại!')
    } else {
      product.price = bid
      setMessage('✅ Đặt giá thành công!')
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <Link to="/">← Quay lại danh sách</Link>
      <h2>{product.name}</h2>
      <img src={product.image} alt={product.name} style={{ width: '300px', borderRadius: '10px' }} />
      <p>Giá hiện tại: {product.price.toLocaleString()}₫</p>

      <input
        type="number"
        value={bid}
        onChange={(e) => setBid(Number(e.target.value))}
        style={{ padding: '5px', marginRight: '10px' }}
      />
      <button onClick={handleBid}>Đặt giá</button>
      <p>{message}</p>
    </div>
  )
}
