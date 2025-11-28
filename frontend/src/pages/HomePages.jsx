import { useState, useEffect } from 'react'
import ProductSection from '../components/ProductSection'
import { productService } from '../services/product.service'
import HeroSection from '../components/home/HeroSection'
export default function HomePage() {
  const [topEnding, setTopEnding] = useState([])
  const [topPrice, setTopPrice] = useState([])
  const [topBidded, setTopBidded] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {

        setLoading(true)

        const [endingRes, priceRes, biddedRes] = await Promise.all([
          productService.getTopEnding(),
          productService.getTopPrice(),
          productService.getTopBidded()
        ])

        setTopEnding(endingRes.data || [])
        setTopPrice(priceRes.data || [])
        setTopBidded(biddedRes.data || [])
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu homepage:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHomepageData()
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      <HeroSection />

      <ProductSection
        title="Sắp kết thúc"
        products={topEnding}
        loading={loading}
      />
      <ProductSection
        title="Giá cao nhất"
        products={topPrice}
        loading={loading}
      />
      <ProductSection
        title="Đấu giá nhiều nhất"
        products={topBidded}
        loading={loading}
      />
    </div>
  )
}