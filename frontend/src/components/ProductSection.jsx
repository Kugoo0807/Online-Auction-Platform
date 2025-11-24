// ProductSection.jsx
import { Link } from 'react-router-dom'

export default function ProductSection({ title, products }) {
  return (
    <div style={{ marginBottom: '40px', marginTop: '30px' }}>
      {/* Tiêu đề section */}
      <h2
        style={{
          backgroundColor: 'var(--color-accent)',   
          color: 'white',                           
          width: 'fit-content',                      
          borderRadius: '20px',
          padding: '8px 16px',                      
          marginBottom: '20px',                      
          fontWeight: '700',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',   
        }}
      >
        🏷️ {title}
      </h2>

      {/* Vùng chứa các card */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          justifyContent: 'flex-start', 
          width: '100%',                 
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              backgroundColor: 'var(--color-card-bg)', 
              border: '1px solid var(--color-card-border)',
              borderRadius: '12px',
              padding: '12px',
              width: '200px',
              textAlign: 'center',
              boxShadow: '0 6px 12px rgba(13,27,42,0.06)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = '0 12px 20px rgba(13,27,42,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(13,27,42,0.06)'
            }}
          >
            <img
              src={p.image}
              alt={p.name}
              style={{
                width: '100%',
                height: '140px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '10px',
              }}
            />
            <h3
              style={{
                color: 'var(--color-primary)',
                fontSize: '16px',
                marginBottom: '8px',
              }}
            >
              {p.name}
            </h3>
            <p
              style={{
                color: 'var(--color-text)',
                fontSize: '14px',
                marginBottom: '10px',
              }}
            >
              Giá khởi điểm: {p.price.toLocaleString()}₫
            </p>
            <Link
              to={`/auction/${p.id}`}
              style={{
                color: 'var(--color-secondary)',
                fontWeight: '600',
                textDecoration: 'none',
                fontSize: '13px',
              }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--color-accent)')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--color-secondary)')}
            >
              Xem chi tiết
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
