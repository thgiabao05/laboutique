// Đường dẫn: src/components/Layout.tsx
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext"; 

export function Layout() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', color: '#111' }}>
      <header style={headerStyle}>
        <h2 style={{ margin: 0, fontWeight: 400, letterSpacing: '3px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#111' }}>LA BOUTIQUE</Link>
        </h2>
        
        <nav style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <Link to="/" style={navLinkStyle}>Trang chủ</Link>
          <Link to="/shop" style={navLinkStyle}>Cửa hàng</Link>
          <Link to="/cart" style={navLinkStyle}>Giỏ hàng ({cartCount})</Link>

          {/* KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Nếu là Admin thì mới hiện link Admin */}
              {user.Role === 'admin' && (
                <Link to="/admin" style={{ ...navLinkStyle, color: 'blue' }}>Quản trị</Link>
              )}
              
              {/* ĐÃ BIẾN THÀNH LINK ĐỂ CLICK SANG TRANG PROFILE */}
              <Link 
                to="/profile" 
                style={{ fontSize: '13px', color: '#666', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.3s' }}
                onMouseOver={(e) => (e.currentTarget.style.color = '#000')}
                onMouseOut={(e) => (e.currentTarget.style.color = '#666')}
              >
                Chào, {user.FullName}
              </Link>
              
              <button onClick={handleLogout} style={logoutBtnStyle}>Thoát</button>
            </div>
          ) : (
            <Link to="/login" style={loginBtnStyle}>Đăng nhập</Link>
          )}
        </nav>
      </header>

      <main style={{ minHeight: '80vh' }}>
        <Outlet />
      </main>

      <footer style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9f9f9', fontSize: '12px' }}>
        © 2026 La Boutique - DH52200380
      </footer>
    </div>
  );
}

// Style bổ sung
const headerStyle = { display: 'flex', justifyContent: 'space-between', padding: '20px 50px', borderBottom: '1px solid #eaeaea', position: 'sticky' as const, top: 0, backgroundColor: '#fff', zIndex: 100, alignItems: 'center' };
const navLinkStyle = { textDecoration: 'none', color: '#333', fontSize: '13px', textTransform: 'uppercase' as const, fontWeight: 500 };
const loginBtnStyle = { ...navLinkStyle, padding: '8px 15px', border: '1px solid #111' };
const logoutBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', textTransform: 'uppercase' as const, color: 'red' };