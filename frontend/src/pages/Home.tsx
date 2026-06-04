// Đường dẫn: src/pages/Home.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

// Cấu trúc dữ liệu sản phẩm
interface Product {
  ProductID: number;
  ProductName: string;
  Price: number;
  ImageURL: string;
}

export function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();

  // Tự động gọi API lấy 4 sản phẩm mới nhất làm "Best Sellers"
  useEffect(() => {
    fetch("https://laboutique.free.je/backend/products.php")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFeaturedProducts(data.slice(0, 4)); // Chỉ lấy 4 món đầu tiên
        }
      })
      .catch(err => console.error("Lỗi tải sản phẩm nổi bật:", err));
  }, []);

  return (
    <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', color: '#111' }}>
      
      {/* 1. HERO BANNER - Hình ảnh tràn viền cực sang */}
      <div style={{ 
        height: '85vh', 
        backgroundImage: 'url("https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=2000")', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
        marginTop: '-40px' // Đẩy lên sát mép Header
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.95)', padding: '60px 100px', backdropFilter: 'blur(10px)' }}>
          <h2 style={{ fontSize: '12px', letterSpacing: '4px', color: '#555', marginBottom: '15px', textTransform: 'uppercase' }}>
            Bộ sưu tập 2026
          </h2>
          <h1 style={{ fontSize: '42px', fontWeight: 300, letterSpacing: '6px', margin: '0 0 25px 0', textTransform: 'uppercase' }}>
            La Boutique
          </h1>
          <Link to="/shop" style={{ 
            display: 'inline-block', padding: '15px 40px', background: '#111', color: '#fff', 
            textDecoration: 'none', letterSpacing: '2px', fontSize: '12px', textTransform: 'uppercase',
            transition: 'background 0.3s'
          }}>
            Khám phá ngay
          </Link>
        </div>
      </div>

      {/* 2. CÂU CHUYỆN THƯƠNG HIỆU */}
      <div style={{ maxWidth: '800px', margin: '120px auto', textAlign: 'center', padding: '0 20px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '30px' }}>
          Nghệ thuật của Mùi hương
        </h3>
        <p style={{ color: '#666', lineHeight: '1.8', fontSize: '15px' }}>
          Mỗi giọt hương tại La Boutique không chỉ là một sản phẩm, mà là một câu chuyện được kể bằng xúc cảm. Chúng tôi tìm kiếm những nguyên liệu quý hiếm nhất từ khắp nơi trên thế giới để tạo ra những kiệt tác độc bản, đánh thức những ký ức ngủ quên và tôn vinh cá tính độc đáo của bạn.
        </p>
      </div>

      {/* 3. SẢN PHẨM NỔI BẬT (Gọi API Động) */}
      <div style={{ background: '#fcfcfc', padding: '100px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 300, letterSpacing: '3px', textTransform: 'uppercase' }}>Được Yêu Thích Nhất</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '30px' }}>
            {featuredProducts.map(p => (
              <div key={p.ProductID} style={{ textAlign: 'center' }}>
                <div style={{ height: '320px', background: '#f5f5f5', marginBottom: '20px', overflow: 'hidden' }}>
                  <img src={p.ImageURL} alt={p.ProductName} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 400, margin: '0 0 10px 0', letterSpacing: '1px' }}>{p.ProductName}</h4>
                <p style={{ color: '#666', fontSize: '14px', margin: '0 0 15px 0' }}>{Number(p.Price).toLocaleString('vi-VN')} ₫</p>
                <button 
                  onClick={() => addToCart({
                    id: p.ProductID, // Ép kiểu về string nếu id của CartItem là string
                    title: p.ProductName,
                    price: p.Price,
                    image: p.ImageURL,
                    quantity: 1 // Mặc định thêm 1 cuốn truyện vào giỏ
                  })}
                  style={{ background: 'none', border: '1px solid #111', padding: '10px 20px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}
                >
                  Thêm vào giỏ
                </button>
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <Link to="/shop" style={{ borderBottom: '1px solid #111', color: '#111', textDecoration: 'none', paddingBottom: '5px', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Xem toàn bộ cửa hàng
            </Link>
          </div>
        </div>
      </div>

      {/* 4. KHU VỰC DANH MỤC LỚN (Categories) */}
      <div style={{ maxWidth: '1200px', margin: '100px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 45%', position: 'relative', height: '600px' }}>
            <img src="https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=800" alt="Nữ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '40px' }}>
              <Link to="/shop" style={{ background: '#fff', padding: '15px 40px', color: '#111', textDecoration: 'none', letterSpacing: '2px', fontSize: '12px', textTransform: 'uppercase' }}>
                Bộ Sưu Tập Nữ
              </Link>
            </div>
          </div>
          <div style={{ flex: '1 1 45%', position: 'relative', height: '600px' }}>
            <img src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800" alt="Unisex" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '40px' }}>
              <Link to="/shop" style={{ background: '#fff', padding: '15px 40px', color: '#111', textDecoration: 'none', letterSpacing: '2px', fontSize: '12px', textTransform: 'uppercase' }}>
                Bộ Sưu Tập Unisex
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 5. ĐĂNG KÝ BẢN TIN (Newsletter) */}
      <div style={{ background: '#111', color: '#fff', padding: '80px 20px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 300, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '20px' }}>
          Trở thành Khách hàng VIP
        </h3>
        <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '30px' }}>
          Nhận đặc quyền ưu tiên mua sắm các bộ sưu tập giới hạn và thiệp mời sự kiện riêng tư.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); alert("Cảm ơn bạn đã đăng ký!"); }} style={{ display: 'flex', maxWidth: '500px', margin: '0 auto', gap: '10px' }}>
          <input 
            type="email" 
            placeholder="Nhập địa chỉ email của bạn..." 
            required
            style={{ flex: 1, padding: '15px 20px', border: '1px solid #333', background: '#000', color: '#fff', outline: 'none' }}
          />
          <button type="submit" style={{ padding: '15px 30px', background: '#fff', color: '#111', border: 'none', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', fontSize: '12px' }}>
            Đăng ký
          </button>
        </form>
      </div>
      
    </div>
  );
}