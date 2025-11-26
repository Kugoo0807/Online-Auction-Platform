import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function HeroSection() {
  const { user } = useAuth();
  
  return (
    <div style={{ background: 'linear-gradient(...)', color: 'white', padding: '60px 40px', borderRadius: '15px', marginBottom: '40px', textAlign: 'center' }}>
       <h1>Chào mừng đến với AuctionHub</h1>
       {!user && <Link to="/signup"><button>Bắt đầu đấu giá ngay</button></Link>}
    </div>
  );
}