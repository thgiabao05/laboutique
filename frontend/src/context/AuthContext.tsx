// Đường dẫn: src/context/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';

export interface User {
  UserID: number;
  FullName: string;
  Username: string;
  Email: string;
  Phone?: string;
  Addresses?: string[];
  Role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateProfile: (phone: string, addresses: string[]) => Promise<boolean>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('laBoutiqueUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('laBoutiqueUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('laBoutiqueUser');
  };

  const updateProfile = async (phone: string, addresses: string[]): Promise<boolean> => {
    if (!user) return false;
    try {
      const response = await fetch('https://laboutique.free.je/backend//update_profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          UserID: user.UserID,
          Phone: phone,
          Addresses: addresses
        }),
      });

      if (response.ok) {
        // Ghi thẳng vào State và bộ nhớ trình duyệt để chống mất dữ liệu khi F5
        const updatedUser = { ...user, Phone: phone, Addresses: addresses };
        setUser(updatedUser);
        localStorage.setItem('laBoutiqueUser', JSON.stringify(updatedUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi kết nối update_profile:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải bọc trong AuthProvider');
  return context;
};