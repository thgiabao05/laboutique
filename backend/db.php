<?php
// 1. Cấp phép cho mọi tên miền (hoặc điền thẳng link Vercel của bạn vào thay dấu *)
header('Access-Control-Allow-Origin: *'); 

// 2. Cấp phép cho các phương thức gửi dữ liệu
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE'); 

// 3. Cấp phép cho các loại Header được gửi lên
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// 4. Xử lý kịch bản request thăm dò (Preflight) của React
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
// ====================================================================
// CẤU HÌNH CORS: Cho phép ReactJS từ Vercel có thể gọi dữ liệu sang Host
// ====================================================================
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
} else {
    header("Access-Control-Allow-Origin: *");
}
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Ngắt luồng ngay nếu là request kiểm tra OPTIONS từ trình duyệt
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// ====================================================================
// CẤU HÌNH KẾT NỐI DATABASE INFINITYFREE (ĐÃ CẬP NHẬT)
// ====================================================================
$host = 'sql206.infinityfree.com';     // Lấy từ MySQL Host Name trong ảnh của bạn
$db   = 'if0_42094727_laboutique';     // Tên database thật trên InfinityFree
$user = 'if0_42094727';                // Lấy từ MySQL User Name trong ảnh của bạn
$pass = 'DevRoNkj7kV'; // SỬA: Nhập mật khẩu ứng dụng/vPanel của tài khoản InfinityFree vào đây

try {
    // Trên host dùng cổng mặc định nên lược bỏ biến $port cho chuỗi kết nối gọn gàng
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Trả lỗi định dạng JSON để ReactJS có thể bắt được và hiện thông báo cụ thể
    http_response_code(500);
    die(json_encode(["error" => "Lỗi kết nối CSDL Hosting: " . $e->getMessage()]));
}
?>