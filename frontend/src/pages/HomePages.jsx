import HeroSection from '../components/home/HeroSection';
import ProductSection from '../components/ProductSection';
import { products } from '../data/products';
export default function HomePage() {
  return (
    <div style={{ padding: '20px' }}>
      <HeroSection />
      
      <ProductSection
        title="🔥 Top 5 sản phẩm gần kết thúc"
        products={products.slice(0, 5)}
      />
      <ProductSection
        title="💰 Top 5 sản phẩm có nhiều lượt ra giá nhất"
        products={products.slice(0, 5)}
      />
      <ProductSection
        title="🏆 Top 5 sản phẩm có giá cao nhất"
        products={products.slice(0, 5)}
      />
    </div>
  );
}