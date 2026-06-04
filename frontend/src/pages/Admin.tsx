// Đường dẫn: src/pages/Admin.tsx
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import OrdersManager from '../components/OrdersManager';

interface Product {
  ProductID: number;
  ProductName: string;
  Price: number;
  ImageURL: string;
  CategoryID: number;
}

interface UserData {
  UserID: number;
  FullName: string;
  Email: string;
  Phone: string;
  Role: string;
}

interface DashboardStats {
  totalRevenue: number;
  newOrders: number;
  totalProducts: number;
}

// Cấu trúc dữ liệu Đánh giá sản phẩm
interface ReviewData {
  ReviewID: number;
  OrderID: string;
  Rating: number;
  Comment: string;
  CreatedAt: string;
  ProductName: string;
  FullName: string;
  Email: string;
}

export function Admin() {
  const { user } = useAuth();

  // ==========================================
  // ĐỔI TÊN TAB TRÌNH DUYỆT THÀNH "Dashboard"
  // ==========================================
  useEffect(() => {
    document.title = "Dashboard"; // Hiện chữ Dashboard khi vào trang này
    
    return () => {
      document.title = "La Boutique"; // Trả lại tên gốc khi rời khỏi trang Admin
    };
  }, []);
  // ==========================================

  // --- STATE QUẢN LÝ ĐIỀU HƯỚNG ---
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'users' | 'reviews'>(
    user && user.Role === 'admin' ? 'overview' : 'orders'
  );

  // --- STATE DỮ LIỆU ---
  const [products, setProducts] = useState<Product[]>([]);
  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalRevenue: 0, newOrders: 0, totalProducts: 0 });
  const [reviewsList, setReviewsList] = useState<ReviewData[]>([]);

  // --- STATE FORM SẢN PHẨM & NGƯỜI DÙNG ---
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Product>({ ProductID: 0, ProductName: "", Price: 0, ImageURL: "", CategoryID: 1 });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userFormData, setUserFormData] = useState<UserData>({ UserID: 0, FullName: "", Email: "", Phone: "", Role: "user" });

  // --- KIỂM TRA QUYỀN TRUY CẬP ---
  if (!user || (user.Role !== 'admin' && user.Role !== 'staff')) {
    return <Navigate to="/" replace />; 
  }

  // --- TỰ ĐỘNG TẢI DỮ LIỆU ---
  useEffect(() => {
    fetchProducts();
    if (activeTab === 'users' && user.Role === 'admin') fetchUsers();
    if (activeTab === 'overview' && user.Role === 'admin') fetchStats();
    if (activeTab === 'reviews' && user.Role === 'admin') fetchReviews();
  }, [activeTab, user.Role]);

  const fetchProducts = () => {
    fetch("https://laboutique.free.je/backend/get_products.php")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Lỗi tải Sản phẩm:", err));
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("https://laboutique.free.je/backend/get_users_admin.php");
      const data = await res.json();
      if (data.status === 'success') setUsersList(data.users);
    } catch (err) { console.error("Lỗi tải người dùng:", err); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("https://laboutique.free.je/backend/get_dashboard_stats.php");
      const data = await res.json();
      if (data.status === 'success') setStats(data.stats);
    } catch (err) { console.error("Lỗi tải Thống kê:", err); }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch("https://laboutique.free.je/backend/get_reviews_admin.php");
      const data = await res.json();
      if (data.status === 'success') setReviewsList(data.reviews);
    } catch (err) { console.error("Lỗi tải Đánh giá:", err); }
  };

  // --- THAO TÁC SẢN PHẨM & NGƯỜI DÙNG ---
  const handleAddClick = () => { setFormData({ ProductID: 0, ProductName: "", Price: 0, ImageURL: "", CategoryID: 1 }); setSelectedFile(null); setShowForm(true); };
  const handleEditClick = (product: Product) => { setFormData(product); setSelectedFile(null); setShowForm(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSend = new FormData();
    dataToSend.append("ProductID", formData.ProductID.toString());
    dataToSend.append("ProductName", formData.ProductName);
    dataToSend.append("Price", formData.Price.toString());
    dataToSend.append("CategoryID", formData.CategoryID.toString());
    dataToSend.append("ImageURL", formData.ImageURL);
    if (selectedFile) dataToSend.append("image", selectedFile);

    try {
      const response = await fetch("https://laboutique.free.je/backend/save_product.php", { method: "POST", body: dataToSend });
      const data = await response.json();
      if (data.status === "success") { alert(data.message); setShowForm(false); fetchProducts(); } else alert(data.message);
    } catch (err) { alert("Lỗi kết nối!"); }
  };

  const handleDelete = async (productId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi cửa hàng không?")) return;
    try {
      const response = await fetch("https://laboutique.free.je/backend/delete_product.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ProductID: productId }) });
      const data = await response.json();
      if (data.status === "success") { alert(data.message); fetchProducts(); } else alert(data.message);
    } catch (err) { alert("Lỗi kết nối!"); }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    if(!window.confirm(`Xác nhận cấp quyền [${newRole}] cho UserID: ${userId}?`)) return;
    try {
      const res = await fetch("https://laboutique.free.je/backend/update_user_role.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ UserID: userId, Role: newRole }) });
      const data = await res.json();
      if(data.status === 'success') { alert('Cập nhật quyền thành công!'); fetchUsers(); }
    } catch (err) { alert("Lỗi kết nối máy chủ"); }
  };

  const handleEditUserClick = (user: UserData) => { setUserFormData(user); setShowUserForm(true); };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("https://laboutique.free.je/backend/update_user_info.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ UserID: userFormData.UserID, FullName: userFormData.FullName, Email: userFormData.Email, Phone: userFormData.Phone }) });
      const data = await res.json();
      if (data.status === 'success') { alert(data.message); setShowUserForm(false); fetchUsers(); } else alert(data.message);
    } catch (err) { alert("Lỗi kết nối máy chủ"); }
  };

  const handleDeleteUser = async (userId: number, email: string) => {
    if (email === 'admin@thebasic.com') { alert("Không thể xóa tài khoản Quản trị gốc!"); return; }
    if (!window.confirm(`Xóa vĩnh viễn tài khoản [${email}]?`)) return;
    try {
      const res = await fetch("https://laboutique.free.je/backend/delete_user.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ UserID: userId, Email: email }) });
      const data = await res.json();
      if (data.status === 'success') { alert(data.message); fetchUsers(); } else alert(data.message);
    } catch (err) { alert("Lỗi kết nối!"); }
  };

  // --- THAO TÁC XÓA ĐÁNH GIÁ ---
  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn ẩn/xóa bình luận đánh giá này khỏi hệ thống không?")) return;
    try {
      const res = await fetch("https://laboutique.free.je/backend/delete_review.php", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ReviewID: reviewId })
      });
      const data = await res.json();
      if (data.status === 'success') { alert(data.message); fetchReviews(); }
    } catch (err) { alert("Lỗi kết nối!"); }
  };

  // ==========================================
  // GIAO DIỆN CÁC TABS
  // ==========================================
  const renderOverview = () => (
    <div>
      <h2 style={pageTitleStyle}>TỔNG QUAN HỆ THỐNG</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div style={cardStyle}>
          <h4 style={cardTitleStyle}>TỔNG DOANH THU</h4>
          <p style={cardValueStyle}>{Number(stats.totalRevenue).toLocaleString('vi-VN')} ₫</p>
          <span style={{ color: '#28a745', fontSize: '13px' }}>Đã thanh toán thành công</span>
        </div>
        <div style={cardStyle}>
          <h4 style={cardTitleStyle}>ĐƠN HÀNG CHỜ XÁC NHẬN</h4>
          <p style={cardValueStyle}>{stats.newOrders}</p>
          <span style={{ color: '#d2691e', fontSize: '13px' }}>Cần gọi điện khách hàng ngay</span>
        </div>
        <div style={cardStyle}>
          <h4 style={cardTitleStyle}>TỔNG SẢN PHẨM</h4>
          <p style={cardValueStyle}>{products.length > 0 ? products.length : stats.totalProducts}</p>
          <span style={{ color: '#666', fontSize: '13px' }}>Mã sản phẩm trong kho</span>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => <OrdersManager />;

  const renderUsers = () => (
    <div>
      <h2 style={pageTitleStyle}>QUẢN LÝ NHÂN SỰ & KHÁCH HÀNG</h2>
      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr style={trHeadStyle}>
              <th style={thStyle}>ID</th><th style={thStyle}>Họ & Tên</th><th style={thStyle}>Liên hệ</th><th style={thStyle}>Quyền hạn</th><th style={thStyle}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map(u => (
              <tr key={u.UserID} style={trBodyStyle}>
                <td style={tdStyle}>#{u.UserID}</td>
                <td style={tdStyle}><strong>{u.FullName}</strong></td>
                <td style={tdStyle}>
                  <div style={{ fontSize: '13px' }}>{u.Email}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{u.Phone || 'Chưa có SĐT'}</div>
                </td>
                <td style={tdStyle}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', backgroundColor: u.Role === 'admin' ? '#111' : (u.Role === 'staff' ? '#d2691e' : '#f0f0f0'), color: u.Role === 'admin' || u.Role === 'staff' ? '#fff' : '#666' }}>{u.Role}</span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select value={u.Role} onChange={(e) => handleRoleChange(u.UserID, e.target.value)} style={{ padding: '6px', fontSize: '12px', border: '1px solid #ccc' }} disabled={u.Email === 'admin@thebasic.com'}>
                      <option value="user">Khách hàng</option><option value="staff">Nhân viên (Staff)</option><option value="admin">Quản trị (Admin)</option>
                    </select>
                    <button onClick={() => handleEditUserClick(u)} style={{ ...actionBtnStyle, color: 'blue', border: '1px solid blue', padding: '4px 8px', borderRadius: '4px' }}>Sửa</button>
                    <button onClick={() => handleDeleteUser(u.UserID, u.Email)} style={{ ...actionBtnStyle, color: 'red', border: '1px solid red', padding: '4px 8px', borderRadius: '4px' }} disabled={u.Email === 'admin@thebasic.com'}>Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showUserForm && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0, fontWeight: 400, textTransform: 'uppercase' }}>CHỈNH SỬA THÔNG TIN</h3>
            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div><label style={labelStyle}>Họ và Tên</label><input required style={inputStyle} value={userFormData.FullName} onChange={e => setUserFormData({...userFormData, FullName: e.target.value})} /></div>
              <div><label style={labelStyle}>Địa chỉ Email</label><input type="email" required style={inputStyle} value={userFormData.Email} onChange={e => setUserFormData({...userFormData, Email: e.target.value})} /></div>
              <div><label style={labelStyle}>Số điện thoại</label><input type="text" style={inputStyle} value={userFormData.Phone} onChange={e => setUserFormData({...userFormData, Phone: e.target.value})} /></div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#111', color: '#fff', border: 'none', cursor: 'pointer' }}>LƯU THÔNG TIN</button>
                <button type="button" onClick={() => setShowUserForm(false)} style={{ flex: 1, padding: '12px', background: '#ccc', color: '#111', border: 'none', cursor: 'pointer' }}>HỦY</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // GIAO DIỆN QUẢN LÝ ĐÁNH GIÁ (NEW TAB)
  const renderReviews = () => (
    <div>
      <h2 style={pageTitleStyle}>QUẢN LÝ ĐÁNH GIÁ & PHẢN HỒI</h2>
      <div style={cardStyle}>
        {reviewsList.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '30px' }}>Chưa có lượt đánh giá sản phẩm nào.</div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr style={trHeadStyle}>
                <th style={thStyle}>Khách hàng</th>
                <th style={thStyle}>Sản phẩm / Đơn hàng</th>
                <th style={thStyle}>Mức độ</th>
                <th style={thStyle}>Nội dung nhận xét</th>
                <th style={thStyle}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reviewsList.map(r => (
                <tr key={r.ReviewID} style={trBodyStyle}>
                  <td style={tdStyle}>
                    <strong>{r.FullName}</strong>
                    <div style={{ fontSize: '11px', color: '#777' }}>{r.Email}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{r.ProductName}</div>
                    <div style={{ fontSize: '11px', color: '#999' }}>Mã ĐH: {r.OrderID}</div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: '#ffc107', fontSize: '14px', fontWeight: 'bold' }}>
                      {"★".repeat(r.Rating)}{"☆".repeat(5 - r.Rating)}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: '13px', fontStyle: 'italic', maxWidth: '300px', lineHeight: '1.4' }}>"{r.Comment || 'Không có bình luận'}"</div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>{new Date(r.CreatedAt).toLocaleDateString('vi-VN')}</div>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => handleDeleteReview(r.ReviewID)} style={{ ...actionBtnStyle, color: 'red', border: '1px solid red', padding: '4px 8px', borderRadius: '4px' }}>Gỡ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const [adminProductFilter, setAdminProductFilter] = useState<'ALL' | 1 | 2>('ALL');
  const renderProducts = () => {
    const filteredAdminProducts = adminProductFilter === 'ALL' ? products : products.filter(p => Number(p.CategoryID) === adminProductFilter);
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ ...pageTitleStyle, margin: 0 }}>QUẢN LÝ KHO HÀNG</h2>
          <button onClick={handleAddClick} style={{ padding: '10px 20px', background: '#111', color: '#fff', border: 'none', cursor: 'pointer', letterSpacing: '1px' }}>+ THÊM SẢN PHẨM</button>
        </div>
        <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center', fontSize: '13px' }}>
          <span style={{ color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Bộ lọc kho:</span>
          <button onClick={() => setAdminProductFilter('ALL')} style={{ padding: '6px 12px', background: adminProductFilter === 'ALL' ? '#111' : '#fff', color: adminProductFilter === 'ALL' ? '#fff' : '#111', border: '1px solid #111', cursor: 'pointer' }}>Tất cả</button>
          <button onClick={() => setAdminProductFilter(1)} style={{ padding: '6px 12px', background: adminProductFilter === 1 ? '#111' : '#fff', color: adminProductFilter === 1 ? '#fff' : '#111', border: '1px solid #111', cursor: 'pointer' }}>Nước hoa Nữ</button>
          <button onClick={() => setAdminProductFilter(2)} style={{ padding: '6px 12px', background: adminProductFilter === 2 ? '#111' : '#fff', color: adminProductFilter === 2 ? '#fff' : '#111', border: '1px solid #111', cursor: 'pointer' }}>Dòng Unisex</button>
        </div>
        <div style={cardStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={trHeadStyle}>
                <th style={thStyle}>Hình ảnh</th><th style={thStyle}>Tên sản phẩm</th><th style={thStyle}>Danh mục</th><th style={thStyle}>Giá bán</th><th style={thStyle}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdminProducts.map(p => (
                <tr key={p.ProductID} style={trBodyStyle}>
                  <td style={tdStyle}><img src={p.ImageURL} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', background: '#eee' }} /></td>
                  <td style={tdStyle}><strong>{p.ProductName}</strong></td>
                  <td style={tdStyle}><span style={{ fontSize: '12px', padding: '4px 8px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '3px', fontWeight: 500 }}>{Number(p.CategoryID) === 1 ? "👩 Nữ" : "👫 Unisex"}</span></td>
                  <td style={tdStyle}>{Number(p.Price).toLocaleString('vi-VN')} ₫</td>
                  <td style={tdStyle}>
                    <button onClick={() => handleEditClick(p)} style={{ ...actionBtnStyle, color: 'blue' }}>Sửa</button>
                    <span style={{ margin: '0 10px', color: '#ccc' }}>|</span>
                    <button onClick={() => handleDelete(p.ProductID)} style={{ ...actionBtnStyle, color: 'red' }}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f8', margin: '-40px' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '250px', backgroundColor: '#111', color: '#fff', padding: '40px 0', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ textAlign: 'center', letterSpacing: '4px', fontWeight: 300, marginBottom: '50px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
          LA BOUTIQUE
        </h3>
        
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
          {user.Role === 'admin' && (
            <li onClick={() => setActiveTab('overview')} style={getSidebarItemStyle(activeTab === 'overview')}>📊 Tổng quan</li>
          )}
          <li onClick={() => setActiveTab('orders')} style={getSidebarItemStyle(activeTab === 'orders')}>📦 Quản lý Đơn hàng</li>
          <li onClick={() => setActiveTab('products')} style={getSidebarItemStyle(activeTab === 'products')}>🏷️ Kho Sản phẩm</li>
          {user.Role === 'admin' && (
            <li onClick={() => setActiveTab('users')} style={getSidebarItemStyle(activeTab === 'users')}>👥 Nhân sự & Khách</li>
          )}
          {/* NÚT REVIEW MỚI THÊM CHO ADMIN */}
          {user.Role === 'admin' && (
            <li onClick={() => setActiveTab('reviews')} style={getSidebarItemStyle(activeTab === 'reviews')}>💬 Quản lý Đánh giá</li>
          )}
        </ul>
        
        <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
          Đang đăng nhập: <br/> 
          <strong style={{color:'#fff'}}>{user.FullName}</strong><br/>
          <span style={{ color: '#d2691e' }}>Vai trò: {user.Role.toUpperCase()}</span>
        </div>
      </div>

      {/* NỘI DUNG */}
      <div style={{ flex: 1, padding: '50px' }}>
        {activeTab === 'overview' && user.Role === 'admin' && renderOverview()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'users' && user.Role === 'admin' && renderUsers()}
        {activeTab === 'reviews' && user.Role === 'admin' && renderReviews()}
      </div>

      {/* MODAL FORM SẢN PHẨM */}
      {showForm && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0, fontWeight: 400 }}>{formData.ProductID === 0 ? "THÊM SẢN PHẨM" : "SỬA SẢN PHẨM"}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div><label style={labelStyle}>Tên nước hoa</label><input required style={inputStyle} value={formData.ProductName} onChange={e => setFormData({...formData, ProductName: e.target.value})} /></div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Giá bán</label><input type="number" required style={inputStyle} value={formData.Price} onChange={e => setFormData({...formData, Price: Number(e.target.value)})} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Danh mục</label><select style={inputStyle} value={formData.CategoryID} onChange={e => setFormData({...formData, CategoryID: Number(e.target.value)})}>
                  <option value={1}>Nữ</option><option value={2}>Unisex</option>
                </select></div>
              </div>
              <div>
                <label style={labelStyle}>Ảnh sản phẩm (Upload)</label>
                <input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)} style={{ ...inputStyle, background: '#f9f9f9' }} />
                {formData.ImageURL && !selectedFile && <p style={{fontSize: '12px', color: 'green', marginTop: '5px'}}>Đang dùng ảnh hiện tại.</p>}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#111', color: '#fff', border: 'none', cursor: 'pointer' }}>LƯU THÔNG TIN</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '12px', background: '#ccc', color: '#111', border: 'none', cursor: 'pointer' }}>HỦY</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- CSS HELPERS ---
const getSidebarItemStyle = (isActive: boolean) => ({
  padding: '15px 30px', cursor: 'pointer', transition: '0.3s',
  backgroundColor: isActive ? '#333' : 'transparent',
  borderLeft: isActive ? '4px solid #fff' : '4px solid transparent',
  color: isActive ? '#fff' : '#888', letterSpacing: '1px'
});

const pageTitleStyle = { fontWeight: 300, letterSpacing: '2px', marginBottom: '30px', textTransform: 'uppercase' as const };
const cardStyle = { background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
const cardTitleStyle = { margin: '0 0 10px 0', color: '#888', fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '1px' };
const cardValueStyle = { margin: '0 0 5px 0', fontSize: '32px', fontWeight: 'bold' as const, color: '#111' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' as const, textAlign: 'left' as const };
const trHeadStyle = { borderBottom: '2px solid #111' };
const trBodyStyle = { borderBottom: '1px solid #eee' };
const thStyle = { padding: '15px 10px', color: '#555', fontSize: '13px', textTransform: 'uppercase' as const };
const tdStyle = { padding: '15px 10px', verticalAlign: 'middle' as const };
const actionBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: 'bold' };
const labelStyle = { display: 'block', fontSize: '12px', color: '#555', marginBottom: '5px', textTransform: 'uppercase' as const };
const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ccc', outline: 'none', boxSizing: 'border-box' as const };
const modalOverlayStyle = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle = { background: '#fff', padding: '30px', width: '100%', maxWidth: '500px', borderRadius: '5px' };