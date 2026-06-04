// Đường dẫn: src/pages/Cart.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export function Cart() {
  const { cart, cartTotal, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleCheckout = () => {
    // Chuyển hướng sang trang Thanh toán để xử lý địa chỉ & SĐT
    navigate('/checkout');
  };

  // Trạng thái: Giỏ hàng trống
  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh' }}>
        <h2 style={{ fontWeight: 300, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Giỏ hàng trống</h2>
        <p style={{ color: '#666', marginBottom: '40px', fontSize: '14px' }}>Bạn chưa thêm chai nước hoa nào vào giỏ hàng.</p>
        <Link 
          to="/shop" 
          style={{ 
            padding: '12px 30px', backgroundColor: '#111', color: '#fff', 
            textDecoration: 'none', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' 
          }}
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  // Trạng thái: Có sản phẩm
  return (
    <div style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 20px', fontFamily: '"Helvetica Neue", Arial, sans-serif', color: '#111' }}>
      <h2 style={{ fontWeight: 300, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '40px', borderBottom: '1px solid #eaeaea', paddingBottom: '20px' }}>
        Giỏ hàng của bạn
      </h2>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* CỘT TRÁI: DANH SÁCH NƯỚC HOA */}
        <div style={{ flex: '1 1 600px' }}>
          {cart.map((item) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid #f5f5f5', gap: '20px' }}>
              
              <div style={{ width: '80px', height: '80px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                 {item.image ? (
                   <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                   <span style={{ fontSize: '10px', color: '#999' }}>NO IMAGE</span>
                 )}
              </div>

              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 10px 0', fontWeight: 500, fontSize: '15px' }}>{item.title}</h4>
                <div style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>{formatPrice(item.price)}</div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ display: 'flex', border: '1px solid #eaeaea', width: 'fit-content' }}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={qtyBtnStyle}>-</button>
                    <div style={{ width: '40px', textAlign: 'center', lineHeight: '30px', fontSize: '13px' }}>{item.quantity}</div>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={qtyBtnStyle}>+</button>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.id)} 
                    style={{ background: 'none', border: 'none', color: '#b22222', fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase' }}
                  >
                    Xóa
                  </button>
                </div>
              </div>
              
              <div style={{ fontWeight: 600, fontSize: '15px' }}>
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        {/* CỘT PHẢI: TỔNG KẾT ĐƠN HÀNG */}
        <div style={{ flex: '1 1 300px', backgroundColor: '#f9f9f9', padding: '30px', height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 20px 0', fontWeight: 400, textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px' }}>Tóm tắt đơn hàng</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px', color: '#666' }}>
            <span>Tạm tính</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '14px', color: '#666' }}>
            <span>Phí vận chuyển</span>
            <span>Tính ở bước sau</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0', paddingTop: '20px', borderTop: '1px solid #eaeaea', fontWeight: 600, fontSize: '18px' }}>
            <span>Tổng cộng</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>

          <button 
            onClick={handleCheckout}
            style={{ width: '100%', padding: '15px', backgroundColor: '#111', color: '#fff', border: 'none', textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer', fontWeight: 500, transition: 'background-color 0.3s' }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#333')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#111')}
          >
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}

const qtyBtnStyle = { background: 'none', border: 'none', width: '30px', height: '30px', cursor: 'pointer', fontSize: '16px', color: '#333' };