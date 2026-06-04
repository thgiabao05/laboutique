// Đường dẫn: src/pages/Register.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export function Register() {
  // State lưu thông tin form
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState(""); 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // State quản lý luồng OTP
  const [isWaitingForOTP, setIsWaitingForOTP] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // THÊM MỚI: State quản lý trạng thái loading để chống spam click
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  
  // --- HÀM 1: GỬI THÔNG TIN ĐĂNG KÝ ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Nếu đang trong quá trình gửi mail thì chặn không cho chạy tiếp
    if (isLoading) return; 

    setError(""); setSuccess("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp!"); return;
    }

    setIsLoading(true); // Bắt đầu khóa nút bấm

    try {
      const response = await fetch("https://laboutique.free.je/backend/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Ánh xạ biến 'fullname' của state thành key 'fullName' cho PHP
        body: JSON.stringify({ fullName: fullname, email, username, password })
      });
      const data = await response.json();

      if (data.status === "success") {
        setSuccess(data.message);
        setIsWaitingForOTP(true); // Kích hoạt màn hình nhập OTP
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Mất kết nối đến máy chủ.");
    } finally {
      setIsLoading(false); // Xong việc (dù thành công hay lỗi) thì mở khóa nút
    }
  };

  // --- HÀM 2: GỬI MÃ OTP LÊN KIỂM TRA ---
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");

    try {
      const response = await fetch("https://laboutique.free.je/backend/verify_otp.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode })
      });
      const data = await response.json();

      if (data.status === "success") {
        setSuccess("Xác thực thành công! Đang chuyển hướng...");
        setTimeout(() => navigate('/login'), 2000); // Xác thực xong mới qua Login
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Mất kết nối đến máy chủ.");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', backgroundColor: '#f9f9f9' }}>
      <div style={{ background: '#fff', padding: '40px', width: '100%', maxWidth: '450px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 300, letterSpacing: '4px', marginBottom: '30px', textTransform: 'uppercase' }}>
          {isWaitingForOTP ? "XÁC THỰC EMAIL" : "TẠO TÀI KHOẢN"}
        </h2>

        {error && <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', marginBottom: '15px', fontSize: '13px', textAlign: 'center', borderRadius: '4px' }}>{error}</div>}
        {success && <div style={{ padding: '10px', background: '#e8f5e9', color: '#2e7d32', marginBottom: '15px', fontSize: '13px', textAlign: 'center', borderRadius: '4px' }}>{success}</div>}

        {/* NẾU CHƯA CÓ OTP THÌ HIỆN FORM ĐĂNG KÝ */}
        {!isWaitingForOTP ? (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div><label style={labelStyle}>Họ và tên</label><input type="text" required value={fullname} onChange={e => setFullname(e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Tên đăng nhập</label><input type="text" required value={username} onChange={e => setUsername(e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Mật khẩu</label><input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Xác nhận mật khẩu</label><input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} /></div>
            
            {/* THÊM MỚI: Tùy chỉnh hiệu ứng cho nút khi đang loading */}
            <button 
              type="submit" 
              disabled={isLoading}
              style={{
                ...btnStyle, 
                opacity: isLoading ? 0.7 : 1, 
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {isLoading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ"}
            </button>

            <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '13px', color: '#666' }}>
              Đã có tài khoản? <Link to="/login" style={{ color: '#111', fontWeight: 'bold', textDecoration: 'none' }}>Đăng nhập</Link>
            </div>
          </form>
        ) : (
          /* NẾU ĐÃ CÓ OTP THÌ HIỆN FORM NHẬP MÃ */
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <p style={{ fontSize: '13px', color: '#555', textAlign: 'center', lineHeight: '1.6' }}>
              Một mã gồm 6 chữ số đã được gửi đến email <strong>{email}</strong>. Vui lòng kiểm tra hộp thư (và mục Spam) để lấy mã.
            </p>
            <div>
              <label style={{...labelStyle, textAlign: 'center'}}>Nhập mã OTP</label>
              <input type="text" required value={otpCode} onChange={e => setOtpCode(e.target.value)} style={{...inputStyle, textAlign: 'center', fontSize: '24px', letterSpacing: '5px'}} placeholder="------" maxLength={6} />
            </div>
            
            <button type="submit" style={btnStyle}>XÁC THỰC</button>
          </form>
        )}
      </div>
    </div>
  );
}

// Style rút gọn
const labelStyle = { display: 'block', fontSize: '12px', color: '#555', marginBottom: '5px', textTransform: 'uppercase' as const };
const inputStyle = { width: '100%', padding: '12px', border: '1px solid #ccc', outline: 'none', boxSizing: 'border-box' as const };
const btnStyle = { marginTop: '10px', padding: '15px', background: '#111', color: '#fff', border: 'none', textTransform: 'uppercase' as const, letterSpacing: '2px', cursor: 'pointer' };