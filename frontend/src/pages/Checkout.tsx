// Đường dẫn: src/pages/Checkout.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const totalPhysicalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const savedAddresses = user?.Addresses || [];
  
  const [phone, setPhone] = useState(user?.Phone || '');
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(savedAddresses.length === 0);
  const [newAddressText, setNewAddressText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user?.Phone) setPhone(user.Phone);
    if (savedAddresses.length > 0) {
      setIsAddingNewAddress(false);
      setSelectedAddressIndex(0);
    } else {
      setIsAddingNewAddress(true);
    }
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (cart.length === 0) return <Navigate to="/shop" replace />;
  if (!user) return <Navigate to="/login" replace />;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalAddress = isAddingNewAddress ? newAddressText : savedAddresses[selectedAddressIndex];

    if (!phone.trim() || !finalAddress?.trim()) {
      alert('Vui lòng cung cấp đầy đủ Số điện thoại và Địa chỉ giao hàng!');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Gọi API lưu đơn hàng thực tế vào hệ thống (MySQL)
      const orderResponse = await fetch('http://laboutique.free.je/BACKEND/create_order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          UserID: user.UserID,
          Phone: phone,
          Address: finalAddress,
          TotalAmount: cartTotal,
          CartItems: cart.map(item => ({ id: item.id, title: item.title, price: item.price, quantity: item.quantity }))
        })
      });

      const orderData = await orderResponse.json();

      if (orderResponse.ok && orderData.status === "success") {
        
        // 2. Xử lý nghiệp vụ cập nhật Sổ địa chỉ (Nếu khách dùng địa chỉ mới)
        let updatedAddresses = [...savedAddresses];
        
        if (isAddingNewAddress && !updatedAddresses.includes(finalAddress)) {
          // Xuất hiện hộp thoại hỏi ý kiến khách hàng
          const setAsDefault = window.confirm("Bạn có muốn đặt địa chỉ mới này làm địa chỉ mặc định cho các lần mua sau không?");
          
          if (updatedAddresses.length >= 3) {
            updatedAddresses.pop(); // Xóa địa chỉ cũ nhất nếu đã lưu đủ 3
          }

          if (setAsDefault) {
            updatedAddresses.unshift(finalAddress); // Đẩy lên đầu làm mặc định
          } else {
            updatedAddresses.push(finalAddress); // Thêm vào cuối, giữ nguyên mặc định cũ
          }
          
          // Đồng bộ Sổ địa chỉ xuống Backend
          await updateProfile(phone, updatedAddresses);
        }

        // 3. Hoàn tất chu trình
        alert(`ĐẶT HÀNG THÀNH CÔNG!\n\nMã đơn hàng: ${orderData.orderId}\nPhương thức: COD (Thanh toán khi nhận hàng)\n\nCảm ơn bạn đã mua sắm tại La Boutique!`);
        clearCart();
        navigate('/profile');
      } else {
        alert(orderData.message || "Lỗi xử lý đơn hàng từ hệ thống.");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Không thể kết nối đến máy chủ. Vui lòng thử lại!");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 20px', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
      <h2 style={{ fontWeight: 300, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '40px', borderBottom: '1px solid #eaeaea', paddingBottom: '20px' }}>
        Thanh toán đơn hàng
      </h2>

      <form onSubmit={handlePlaceOrder} style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* CỘT TRÁI */}
        <div style={{ flex: '1 1 500px' }}>
          <h3 style={{ fontWeight: 500, fontSize: '16px', marginBottom: '25px', textTransform: 'uppercase' }}>1. Thông tin giao hàng</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Họ và tên người nhận</label>
            <input type="text" value={user.FullName} disabled style={{...inputStyle, backgroundColor: '#f5f5f5', color: '#666'}} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Số điện thoại liên hệ</label>
            <input type="text" required placeholder="VD: 0901234567" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={labelStyle}>Địa chỉ nhận hàng</label>
            
            {savedAddresses.length > 0 && !isAddingNewAddress && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                {savedAddresses.map((addr, index) => (
                  <label key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', border: selectedAddressIndex === index ? '1px solid #111' : '1px solid #eaeaea', cursor: 'pointer', backgroundColor: selectedAddressIndex === index ? '#fcfcfc' : '#fff' }}>
                    <input type="radio" name="address" checked={selectedAddressIndex === index} onChange={() => setSelectedAddressIndex(index)} style={{ marginTop: '3px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', lineHeight: '1.4' }}>{addr}</span>
                      {index === 0 && <span style={{ fontSize: '10px', color: '#111', fontWeight: 600, marginTop: '4px' }}>[MẶC ĐỊNH]</span>}
                    </div>
                  </label>
                ))}
                
                <button type="button" onClick={() => setIsAddingNewAddress(true)} style={{ textAlign: 'left', background: 'none', border: 'none', color: '#666', fontSize: '13px', textDecoration: 'underline', cursor: 'pointer', padding: 0, marginTop: '5px' }}>
                  + Sử dụng địa chỉ nhận hàng hoàn toàn mới
                </button>
              </div>
            )}

            {isAddingNewAddress && (
              <div>
                <textarea required={isAddingNewAddress} rows={3} placeholder="Nhập địa chỉ mới chi tiết (Số nhà, tên đường, phường, quận)..." value={newAddressText} onChange={(e) => setNewAddressText(e.target.value)} style={{...inputStyle, resize: 'vertical'}} />
                {savedAddresses.length > 0 && (
                  <button type="button" onClick={() => setIsAddingNewAddress(false)} style={{ textAlign: 'left', background: 'none', border: 'none', color: '#d2691e', fontSize: '13px', textDecoration: 'underline', cursor: 'pointer', padding: 0, marginTop: '10px' }}>
                    Quay lại chọn địa chỉ có sẵn trong hồ sơ
                  </button>
                )}
              </div>
            )}
          </div>

          <h3 style={{ fontWeight: 500, fontSize: '16px', marginBottom: '20px', marginTop: '40px', textTransform: 'uppercase' }}>2. Phương thức vận chuyển</h3>
          <div style={{ padding: '15px', border: '1px solid #111', backgroundColor: '#fcfcfc' }}>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Thanh toán khi nhận hàng (COD)</span>
            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>Kiểm tra bưu kiện và thanh toán tiền mặt trực tiếp cho người giao hàng.</p>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div style={{ flex: '1 1 350px', backgroundColor: '#f9f9f9', padding: '30px', height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 20px 0', fontWeight: 400, textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px' }}>Hóa đơn</h3>
          <div style={{ borderBottom: '1px solid #eaeaea', paddingBottom: '20px', marginBottom: '20px' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px' }}>
                <span style={{ color: '#555' }}>{item.quantity} x {item.title}</span>
                <span style={{ fontWeight: 500 }}>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0', paddingTop: '20px', borderTop: '1px solid #eaeaea', fontWeight: 600, fontSize: '18px' }}>
            <span>Tổng thanh toán:</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
          <button type="submit" disabled={isProcessing} style={{ width: '100%', padding: '15px', backgroundColor: '#111', color: '#fff', border: 'none', textTransform: 'uppercase', letterSpacing: '2px', cursor: isProcessing ? 'not-allowed' : 'pointer', fontWeight: 500, opacity: isProcessing ? 0.7 : 1 }}>
            {isProcessing ? 'Đang ghi nhận đơn...' : 'Xác nhận đặt hàng'}
          </button>
        </div>
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', color: '#555', marginBottom: '8px', textTransform: 'uppercase' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px', border: '1px solid #ccc', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };