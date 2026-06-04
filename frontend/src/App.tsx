// Đường dẫn: src/App.tsx
import { Register } from "./pages/Register";
import { type ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Shop } from "./pages/Shop";
import { Cart } from "./pages/Cart";
import { Admin } from "./pages/Admin";
import { Login } from "./pages/Login";
import { useAuth } from "./context/AuthContext";
import { Home } from "./pages/Home";
import { Profile }  from "./pages/Profile";
import { Checkout } from "./pages/Checkout";
import { CartProvider } from "./context/CartContext"; 

// Component "Người gác cổng" cho khu vực Quản trị
const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  
  // Kiểm tra: Nếu không có user, HOẶC user không phải là admin/staff thì đá về trang đăng nhập
  if (!user || (user.Role !== 'admin' && user.Role !== 'staff')) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>; 
};

function App() {
  return (
    <CartProvider>
      <Routes>
        {/* =======================================================
            1. KHU VỰC KHÁCH HÀNG (STOREFRONT)
            Nằm gọn trong <Layout /> để luôn có thanh Menu và Footer
        ======================================================== */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* =======================================================
            2. KHU VỰC QUẢN TRỊ (BACK-OFFICE)
            Nằm NGOÀI <Layout /> để có giao diện tràn viền, độc lập
        ======================================================== */}
        <Route path="/admin" element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        } />
        
        {/* Tạo thêm một bí danh (alias) /dashboard để khớp với file Login.tsx */}
        <Route path="/dashboard" element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        } />

      </Routes>
    </CartProvider>
  );
}

export default App;