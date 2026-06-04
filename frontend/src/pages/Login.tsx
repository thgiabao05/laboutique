// Đường dẫn: src/pages/Login.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("https://laboutique.free.je/BACKEND/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Username: username, Password: password }) 
      });
      
      const data = await response.json();

      if (response.ok && data.user) {
        login(data.user); 
        
        // --- KIỂM TRA NGHIỆP VỤ: Phân luồng ngay từ cửa ---
        // Nếu là quản trị viên hoặc nhân viên, bay thẳng vào Dashboard
        if (data.user.Role === 'admin' || data.user.Role === 'staff') {
          navigate('/dashboard'); 
        } else {
          // Nếu là khách hàng bình thường, ra trang chủ mua sắm
          navigate('/'); 
        }
        // ----------------------------------------------------
        
      } else {
        // Hiển thị chính xác lỗi từ PHP trả về
        setError(data.message || "Đăng nhập thất bại.");
      }
    } catch (err) {
      setError("Mất kết nối đến máy chủ. Vui lòng kiểm tra lại WAMP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', backgroundColor: '#f9f9f9' }}>
      <div style={{ background: '#fff', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 300, letterSpacing: '4px', marginBottom: '30px', textTransform: 'uppercase' }}>
          ĐĂNG NHẬP
        </h2>

        {error && <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', marginBottom: '15px', fontSize: '13px', textAlign: 'center', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={labelStyle}>Tên đăng nhập / Email</label>
            <input type="text" required value={username} onChange={e => setUsername(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Mật khẩu</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
          </div>
          
          <button 
            type="submit" disabled={isLoading}
            style={{ ...btnStyle, opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.3s' }}
          >
            {isLoading ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP"}
          </button>
          
          <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '13px', color: '#666' }}>
            Chưa có tài khoản? <Link to="/register" style={{ color: '#111', fontWeight: 'bold', textDecoration: 'none' }}>Đăng ký ngay</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '12px', color: '#555', marginBottom: '5px', textTransform: 'uppercase' as const };
const inputStyle = { width: '100%', padding: '12px', border: '1px solid #ccc', outline: 'none', boxSizing: 'border-box' as const };
const btnStyle = { marginTop: '10px', padding: '15px', background: '#111', color: '#fff', border: 'none', textTransform: 'uppercase' as const, letterSpacing: '2px', cursor: 'pointer' };