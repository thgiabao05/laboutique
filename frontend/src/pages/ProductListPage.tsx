import { useEffect, useState } from "react"

// Định nghĩa kiểu dữ liệu giống sinh viên làm TypeScript
interface Product {
  ProductID: number;
  ProductName: string;
  Price: number;
  ImageURL: string;
}

export function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([])

  // Gọi API từ WAMP khi trang vừa load xong
  useEffect(() => {
    fetch("https://laboutique.free.je/backend/products.php")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.log("Lỗi gọi API: ", err))
  }, [])

  return (
    <div>
      <h3>Danh sách Nước hoa (Dữ liệu từ MySQL)</h3>
      <div style={{ display: 'flex', gap: '20px' }}>
        {products.map(p => (
          <div key={p.ProductID} style={{ border: '1px solid #ccc', padding: '10px', width: '200px' }}>
            <img src={p.ImageURL} alt={p.ProductName} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <h4>{p.ProductName}</h4>
            <p style={{ color: 'red', fontWeight: 'bold' }}>{p.Price.toLocaleString('vi-VN')} VNĐ</p>
            <button style={{ width: '100%', padding: '10px', background: 'black', color: 'white' }}>
              Thêm vào giỏ
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}