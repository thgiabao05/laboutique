// Đường dẫn: src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Định nghĩa cấu trúc dữ liệu đơn hàng trả về từ API
interface Order {
  OrderID: string;
  TotalAmount: number;
  OrderStatus: string;
  CreatedAt: string;
  TotalItems: number;
}

export function Profile() {
  const { user, updateProfile } = useAuth(); 
  
  // State quản lý luồng Cập nhật hồ sơ (Giữ nguyên của bạn)
  const [isEditing, setIsEditing] = useState(false);
  const [editPhone, setEditPhone] = useState(user?.Phone || '');
  const [editAddresses, setEditAddresses] = useState<string[]>(user?.Addresses || []);
  const [isSaving, setIsSaving] = useState(false);

  // State quản lý luồng Đơn hàng thật
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'Pending' | 'Processing' | 'Delivering' | 'Completed' | 'Cancelled'>('ALL');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Tự động gọi API lấy đơn hàng khi vào trang Profile
  useEffect(() => {
    if (user?.UserID) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('https://laboutique.free.je/backend/get_orders.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ UserID: user.UserID })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách đơn hàng:', error);
    }
  };

  // Các hàm định dạng hiển thị
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const translateStatus = (status: string) => {
    switch(status) {
      case 'Pending': return { text: 'CHỜ XÁC NHẬN', color: '#d2691e' };
      case 'Processing': return { text: 'ĐANG ĐÓNG GÓI', color: '#555' };
      case 'Delivering': return { text: 'ĐANG GIAO HÀNG', color: '#1a73e8' };
      case 'Completed': return { text: 'ĐÃ GIAO', color: 'green' };
      case 'Cancelled': return { text: 'ĐÃ HỦY', color: 'red' }; // <-- Thêm dòng này
      default: return { text: status, color: '#111' };
    }
  };

  // --- LOGIC XỬ LÝ HỒ SƠ (Của bạn) ---
  const handleSaveProfile = () => {
    setIsSaving(true);
    const finalAddresses = editAddresses.filter(addr => addr.trim() !== '');
    setEditAddresses(finalAddresses);

    setTimeout(() => {
      if (updateProfile) {
        updateProfile(editPhone, finalAddresses);
      }
      alert("Đã cập nhật thông tin thành công!");
      setIsSaving(false);
      setIsEditing(false); 
    }, 1000);
  };

  const handleAddressChange = (index: number, value: string) => {
    const newAddrs = [...editAddresses];
    newAddrs[index] = value;
    setEditAddresses(newAddrs);
  };

  const handleRemoveAddress = (index: number) => {
    const newAddrs = editAddresses.filter((_, i) => i !== index);
    setEditAddresses(newAddrs);
  };

  const handleSetDefault = (index: number) => {
    const currentAddresses = user?.Addresses ? [...user.Addresses] : [];
    if (currentAddresses.length > 0) {
      const selected = currentAddresses.splice(index, 1)[0];
      currentAddresses.unshift(selected);
      
      if (updateProfile) {
        updateProfile(user?.Phone || '', currentAddresses);
      }
      setEditAddresses(currentAddresses);
    }
  };

  // Lọc đơn hàng theo Tab đang chọn
  const filteredOrders = activeTab === 'ALL' 
    ? orders 
    : orders.filter(order => order.OrderStatus === activeTab);

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        
        {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN */}
        <div style={{ flex: '1 1 300px', backgroundColor: '#f9f9f9', padding: '30px', height: 'fit-content' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#111', color: '#fff', fontSize: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
              {user?.FullName?.charAt(0)}
            </div>
            <h3 style={{ margin: '0 0 5px 0', fontWeight: 500 }}>{user?.FullName}</h3>
            <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>@{user?.Username}</p>
          </div>

          <div style={{ fontSize: '14px', lineHeight: '2' }}>
            <div style={infoRowStyle}>
              <strong>Email:</strong> 
              <span>{user?.Email}</span>
            </div>
            
            <div style={infoRowStyle}>
              <strong>Điện thoại:</strong> 
              {isEditing ? (
                <input 
                  type="text" 
                  value={editPhone} 
                  onChange={(e) => setEditPhone(e.target.value)}
                  style={inputStyle}
                  placeholder="Nhập số điện thoại..."
                />
              ) : (
                <span>{user?.Phone || 'Chưa cập nhật'}</span>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <strong>Sổ địa chỉ ({(user?.Addresses?.length || 0)}/3):</strong> 
              
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {editAddresses.map((addr, index) => (
                    <div key={index} style={{ display: 'flex', gap: '5px' }}>
                      <textarea 
                        rows={2}
                        value={addr} 
                        onChange={(e) => handleAddressChange(index, e.target.value)}
                        style={{ ...inputStyle, flex: 1, resize: 'vertical' }}
                        placeholder="Nhập địa chỉ nhận hàng..."
                      />
                      <button 
                        onClick={() => handleRemoveAddress(index)}
                        title="Xóa địa chỉ này"
                        style={{ padding: '0 10px', backgroundColor: '#fff', border: '1px solid #ff4d4f', color: '#ff4d4f', cursor: 'pointer', fontSize: '12px' }}
                      >
                        X
                      </button>
                    </div>
                  ))}
                  
                  {editAddresses.length < 3 && (
                    <button 
                      onClick={() => setEditAddresses([...editAddresses, ''])}
                      style={{ padding: '10px', backgroundColor: '#f0f0f0', border: '1px dashed #ccc', cursor: 'pointer', fontSize: '12px', color: '#666' }}
                    >
                      + THÊM ĐỊA CHỈ
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {(user?.Addresses?.length || 0) > 0 ? (
                    user?.Addresses!.map((addr, index) => (
                      <div key={index} style={{ padding: '12px', backgroundColor: '#fff', border: index === 0 ? '1px solid #111' : '1px solid #eaeaea', fontSize: '13px', lineHeight: '1.5', position: 'relative' }}>
                        {index === 0 && (
                          <span style={{ position: 'absolute', top: '-8px', right: '10px', backgroundColor: '#111', color: '#fff', padding: '2px 8px', fontSize: '10px', fontWeight: 600, letterSpacing: '1px' }}>
                            MẶC ĐỊNH
                          </span>
                        )}
                        
                        {addr}
                        
                        {index !== 0 && (
                          <div style={{ marginTop: '8px', textAlign: 'right' }}>
                            <button 
                              onClick={() => handleSetDefault(index)} 
                              style={{ background: 'none', border: 'none', fontSize: '11px', color: '#666', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                            >
                              Đặt làm mặc định
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: '13px', color: '#666' }}>Chưa có địa chỉ nào</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {isEditing ? (
            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
              <button onClick={() => {
                setEditPhone(user?.Phone || '');
                setEditAddresses(user?.Addresses || []);
                setIsEditing(false);
              }} style={{ flex: 1, padding: '12px', backgroundColor: '#fff', border: '1px solid #ccc', cursor: 'pointer', fontSize: '12px', textTransform: 'uppercase' }}>Hủy</button>
              
              <button onClick={handleSaveProfile} disabled={isSaving} style={{ flex: 1, padding: '12px', backgroundColor: '#111', color: '#fff', border: '1px solid #111', cursor: isSaving ? 'wait' : 'pointer', fontSize: '12px', textTransform: 'uppercase' }}>
                {isSaving ? 'Đang lưu...' : 'Lưu lại'}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => {
                setEditPhone(user?.Phone || '');
                setEditAddresses(user?.Addresses || []);
                setIsEditing(true);
              }}
              style={{ width: '100%', padding: '12px', marginTop: '30px', backgroundColor: '#fff', border: '1px solid #111', cursor: 'pointer', textTransform: 'uppercase', fontSize: '12px' }}
            >
              Cập nhật thông tin
            </button>
          )}
        </div>

        {/* CỘT PHẢI: QUẢN LÝ ĐƠN HÀNG THỰC TẾ */}
        <div style={{ flex: '1 1 700px' }}>
          <h2 style={{ fontWeight: 300, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '30px', marginTop: 0 }}>
            Quản lý đơn hàng
          </h2>

          <div style={{ display: 'flex', borderBottom: '1px solid #eaeaea', marginBottom: '20px', gap: '20px', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '5px' }}>
            <button onClick={() => setActiveTab('ALL')} style={tabStyle(activeTab === 'ALL')}>Tất cả</button>
            <button onClick={() => setActiveTab('Pending')} style={tabStyle(activeTab === 'Pending')}>Chờ xác nhận</button>
            <button onClick={() => setActiveTab('Processing')} style={tabStyle(activeTab === 'Processing')}>Đang đóng gói</button>
            <button onClick={() => setActiveTab('Delivering')} style={tabStyle(activeTab === 'Delivering')}>Đang giao</button>
            <button onClick={() => setActiveTab('Completed')} style={tabStyle(activeTab === 'Completed')}>Đã giao</button>
            <button onClick={() => setActiveTab('Cancelled')} style={tabStyle(activeTab === 'Cancelled')}>Đã hủy</button>
          </div>

          {filteredOrders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {filteredOrders.map(order => {
                const statusInfo = translateStatus(order.OrderStatus);
                return (
                  <div key={order.OrderID} style={{ border: '1px solid #eaeaea', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #eaeaea', paddingBottom: '15px', marginBottom: '15px' }}>
                      <div>
                        <strong style={{ fontSize: '14px' }}>{order.OrderID}</strong>
                        <span style={{ fontSize: '12px', color: '#666', marginLeft: '15px' }}>{formatDate(order.CreatedAt)}</span>
                      </div>
                      <span style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 500, color: statusInfo.color }}>
                        {statusInfo.text}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: '#555' }}>Gồm {order.TotalItems} sản phẩm</span>
                      <strong style={{ fontSize: '16px' }}>{formatPrice(order.TotalAmount)}</strong>
                    </div>
                    {order.OrderStatus === 'Completed' && (
                      <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #eaeaea', textAlign: 'right' }}>
                        <button 
                          onClick={() => {
                            const rating = prompt("Mức độ hài lòng của bạn từ 1 đến 5 sao?\n(Nhập số từ 1-5):", "5");
                            
                            // Validate nếu khách nhập bậy bạ
                            if (!rating || isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
                              alert("Vui lòng nhập số sao hợp lệ từ 1 đến 5!");
                              return;
                            }

                            const comment = prompt("Nhập ý kiến bình luận của bạn về sản phẩm/dịch vụ:");
                            
                            fetch("https://laboutique.free.je/backend/add_review.php", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                OrderID: order.OrderID,
                                ProductID: 1, // Mặc định ID sản phẩm (Có thể linh động nâng cấp sau)
                                UserID: user.UserID,
                                Rating: Number(rating),
                                Comment: comment
                              })
                            })
                            .then(res => res.json())
                            .then(data => alert(data.message))
                            .catch(err => alert("Lỗi kết nối tới máy chủ!"));
                          }}
                          style={{ padding: '8px 16px', background: '#111', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}
                        >
                          ⭐ Đánh giá đơn hàng
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#999', fontSize: '14px' }}>
              Không có đơn hàng nào trong trạng thái này.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Styling helpers
const infoRowStyle: React.CSSProperties = { 
  display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f5f5f5', paddingBottom: '10px', marginBottom: '10px', alignItems: 'center'
};
const inputStyle: React.CSSProperties = {
  padding: '8px', border: '1px solid #ccc', outline: 'none', fontSize: '13px', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit'
};
const tabStyle = (isActive: boolean): React.CSSProperties => ({
  background: 'none', border: 'none', padding: '10px 0', fontSize: '14px', textTransform: 'uppercase', cursor: 'pointer',
  borderBottom: isActive ? '2px solid #111' : '2px solid transparent', color: isActive ? '#111' : '#888', fontWeight: isActive ? 500 : 400
});