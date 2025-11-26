import { categories } from '../../data/categories'; // Nhớ chỉnh đường dẫn import đúng

export default function CategoryMenu({ show, onHover, onClickCategory }) {
  if (!show) return null;

  return (
    <div 
      style={{ position: 'absolute', top: '100%', left: '0', width: '600px', backgroundColor: '#FFFFFF', display: 'flex', flexWrap: 'wrap', gap: '30px', padding: '25px', borderRadius: '15px', boxShadow: '0 8px 25px rgba(0,0,0,0.15)', zIndex: 1000, border: '1px solid #E9ECEF' }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {categories.map((category, index) => (
        <div key={index} style={{ minWidth: '250px', cursor: 'pointer' }} onClick={() => onClickCategory(category.name)}>
           {/* ... Giữ nguyên code hiển thị category và subcategory cũ ... */}
           <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-primary)', borderBottom: '2px solid var(--color-accent)' }}>{category.name}</h4>
           {/* Mapping subcategories... */}
        </div>
      ))}
    </div>
  );
}