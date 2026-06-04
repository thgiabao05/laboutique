// Đường dẫn: src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { CartProvider } from './context/CartContext.tsx' // Import vào
import { AuthProvider } from './context/AuthContext.tsx'
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
     <CartProvider> {/* Bọc nó ở đây */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
     </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
)