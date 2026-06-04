// Đường dẫn: src/pages/Shop.tsx
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

interface Product {
  ProductID: number;
  ProductName: string;
  Price: number;
  ImageURL: string;
  CategoryID: number; // 1: Nữ, 2: Unisex
}

export function Shop() {
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State quản lý danh mục đang chọn để lọc (Mặc định là 'ALL' - Tất cả)
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 1 | 2>('ALL');

  useEffect(() => {
    fetch("https://laboutique.free.je/BACKEND/products.php")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Lỗi tải danh sách sản phẩm:", err);
        setIsLoading(false);
      });
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // --- LOGIC LỌC SẢN PHẨM THEO DANH MỤC ---
  const filteredProducts = selectedCategory === 'ALL'
    ? products
    : products.filter(p => Number(p.CategoryID) === selectedCategory);

  return (
    <div style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
      <h2 style={{ fontWeight: 300, letterSpacing: '3px', textTransform: 'uppercase', textAlign: 'center', marginBottom: '20px' }}>
        Sản phẩm của chúng tôi
      </h2>

      {/* --- THANH BỘ LỌC DANH MỤC PHONG CÁCH TỐI GIẢN --- */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '50px', borderBottom: '1px solid #eaeaea', paddingBottom: '15px' }}>
        <button 
          onClick={() => setSelectedCategory('ALL')} 
          style={categoryTabStyle(selectedCategory === 'ALL')}
        >
          Tất cả bộ sưu tập
        </button>
        <button 
          onClick={() => setSelectedCategory(1)} 
          style={categoryTabStyle(selectedCategory === 1)}
        >
          Nước hoa Nữ
        </button>
        <button 
          onClick={() => setSelectedCategory(2)} 
          style={categoryTabStyle(selectedCategory === 2)}
        >
          Dòng Unisex
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>Đang tải danh sách nước hoa...</div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#999', fontSize: '14px' }}>
          Hiện chưa có sản phẩm nào thuộc danh mục này.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '40px' }}>
          {filteredProducts.map(product => (
            <div key={product.ProductID} style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#fff', border: '1px solid #eee', padding: '15px' }}>
              
              <div style={{ width: '100%', height: '280px', backgroundColor: '#f9f9f9', marginBottom: '20px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src={product.ImageURL} 
                  alt={product.ProductName} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/260x280?text=No+Image'; }}
                />
              </div>
              
              <div style={{ textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Hiển thị nhãn danh mục nhỏ phía trên tên sản phẩm */}
                  <span style={{ fontSize: '11px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>
                    {Number(product.CategoryID) === 1 ? "Nước hoa Nữ" : "Unisex"}
                  </span>
                  <h4 style={{ margin: '0 0 10px 0', fontWeight: 400, fontSize: '14px', textTransform: 'uppercase', color: '#111', minHeight: '34px', lineHeight: '1.4' }}>
                    {product.ProductName}
                  </h4>
                  <p style={{ margin: '0 0 20px 0', fontWeight: 600, color: '#111', fontSize: '14px' }}>
                    {formatPrice(product.Price)}
                  </p>
                </div>

                <button 
                  onClick={() => {
                    addToCart({
                      id: product.ProductID,
                      title: product.ProductName,
                      price: Number(product.Price),
                      image: product.ImageURL,
                      quantity: 1
                    });
                    alert(`Đã thêm [${product.ProductName}] vào giỏ hàng!`);
                  }}
                  style={{ width: '100%', padding: '12px', backgroundColor: '#111', color: '#fff', border: 'none', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '11px', cursor: 'pointer' }}
                >
                  Thêm vào giỏ hàng
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Style hỗ trợ cho thanh chọn danh mục
const categoryTabStyle = (isActive: boolean): React.CSSProperties => ({
  background: 'none', border: 'none', padding: '5px 0', fontSize: '13px', textTransform: 'uppercase', cursor: 'pointer',
  letterSpacing: '1.5px', transition: 'all 0.3s',
  borderBottom: isActive ? '2px solid #111' : '2px solid transparent',
  color: isActive ? '#111' : '#888',
  fontWeight: isActive ? 600 : 400
});