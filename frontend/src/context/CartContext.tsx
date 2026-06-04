// Đường dẫn: src/context/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Cấu trúc chuẩn của một sản phẩm nước hoa trong giỏ
export interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // Lấy thông tin user hiện tại từ AuthContext

  // 1. Khởi tạo giỏ hàng mặc định là mảng rỗng (Không gọi trực tiếp từ localStorage ở đây nữa)
  const [cart, setCart] = useState<CartItem[]>([]);

  // 2. NGHIỆP VỤ BẢO MẬT: Load giỏ hàng theo từng tài khoản
  useEffect(() => {
    if (user) {
      // Nếu đã đăng nhập, tìm giỏ hàng có gắn mã UserID của người đó
      const savedCart = localStorage.getItem(`laBoutiqueCart_${user.UserID}`);
      setCart(savedCart ? JSON.parse(savedCart) : []);
    } else {
      // Nếu chưa đăng nhập, ép giỏ hàng về rỗng
      setCart([]);
    }
  }, [user]);

  // 3. NGHIỆP VỤ LƯU TRỮ: Lưu giỏ hàng kèm mã UserID
  useEffect(() => {
    // Chỉ lưu xuống khi có người dùng đang đăng nhập
    if (user) {
      localStorage.setItem(`laBoutiqueCart_${user.UserID}`, JSON.stringify(cart));
    }
  }, [cart, user]);
// Dùng phương thức .reduce() để cộng dồn thuộc tính 'Quantity' của từng món
//const totalQuantity = cart.reduce((total, item) => total + (item.Quantity || 1), 0);
  // Đếm số loại sản phẩm (SKU)
  const cartCount = cart.length;
  
  // Tính tổng tiền
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const addToCart = (newItem: CartItem) => {
    // Chặn không cho thêm vào giỏ nếu chưa đăng nhập
    if (!user) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === newItem.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, newItem];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return; 
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, cartCount, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart phải được bọc trong CartProvider');
  return context;
};