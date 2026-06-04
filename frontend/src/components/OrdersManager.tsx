// Đường dẫn: src/components/OrdersManager.tsx
import { useState, useEffect } from 'react';

interface OrderInfo {
  OrderID: string;
  FullName: string;
  Phone: string;
  Address: string;
  TotalAmount: number;
  OrderStatus: string;
  CreatedAt: string;
}

export default function OrdersManager() {
  const [orders, setOrders] = useState<OrderInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Gọi API lấy toàn bộ đơn hàng
  const fetchOrders = () => {
    fetch("https://laboutique.free.je/backend/get_all_orders.php")
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setOrders(data.orders);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Lỗi tải đơn hàng:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Hàm xử lý khi Admin đổi trạng thái
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!window.confirm(`Xác nhận đổi trạng thái đơn ${orderId}?`)) return;

    try {
      const response = await fetch("https://laboutique.free.je/backend/update_order_status.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ OrderID: orderId, OrderStatus: newStatus })
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        fetchOrders(); // Tải lại bảng để cập nhật màu sắc
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ!");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (isLoading) return <div style={{ padding: '30px' }}>Đang tải dữ liệu đơn hàng...</div>;

  return (
    <div>
      <h2 style={{ fontWeight: 300, letterSpacing: '2px', marginBottom: '30px', textTransform: 'uppercase' }}>
        QUẢN LÝ ĐƠN HÀNG TOÀN HỆ THỐNG
      </h2>

      <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>Chưa có đơn hàng nào trong hệ thống.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #111' }}>
                <th style={thStyle}>Mã ĐH / Ngày đặt</th>
                <th style={thStyle}>Khách hàng / Giao tới</th>
                <th style={thStyle}>Tổng tiền</th>
                <th style={thStyle}>Cập nhật Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.OrderID} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={tdStyle}>
                    <strong style={{ fontSize: '14px', color: '#111' }}>{order.OrderID}</strong>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{formatDate(order.CreatedAt)}</div>
                  </td>
                  
                  <td style={tdStyle}>
                    <strong style={{ fontSize: '13px' }}>{order.FullName || 'Khách ẩn danh'}</strong> - {order.Phone}
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', maxWidth: '300px', lineHeight: '1.4' }}>
                      📍 {order.Address}
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <strong style={{ color: '#d2691e' }}>{formatPrice(order.TotalAmount)}</strong>
                  </td>

                  <td style={tdStyle}>
                    <select 
                      value={order.OrderStatus}
                      onChange={(e) => handleStatusChange(order.OrderID, e.target.value)}
                      style={{ 
                        padding: '8px 12px', 
                        fontSize: '12px', 
                        fontWeight: 600,
                        border: '1px solid #ccc',
                        outline: 'none',
                        cursor: 'pointer',
                        backgroundColor: order.OrderStatus === 'Completed' ? '#e6f4ea' : (order.OrderStatus === 'Delivering' ? '#e8f0fe' : '#fff')
                      }}
                    >
                      <option value="Pending">🟠 Chờ xác nhận</option>
                      <option value="Processing">📦 Đang đóng gói</option>
                      <option value="Delivering">🚚 Đang giao hàng</option>
                      <option value="Completed">✅ Đã giao thành công</option>
                      <option value="Cancelled">❌ Hủy đơn</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const thStyle = { padding: '15px 10px', color: '#555', fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '1px' };
const tdStyle = { padding: '20px 10px', verticalAlign: 'top' as const };