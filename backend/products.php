<?php
// Đường dẫn: BACKEND/products.php
// Tắt cảnh báo HTML mặc định của PHP để không làm hỏng chuỗi JSON
ini_set('display_errors', 0);
error_reporting(0);

// Đồng bộ cơ chế CORS an toàn giống hệt file login.php và save_product.php
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
}
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit(0);
}
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';

try {
    // Thêm ORDER BY ProductID DESC để sản phẩm mới thêm sẽ luôn hiện lên đầu tiên
    $stmt = $pdo->query("SELECT * FROM products ORDER BY ProductID DESC");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode($products);
    
} catch (PDOException $e) {
    http_response_code(500);
    // Trả về JSON chứa mã lỗi thay vì văng mã HTML
    echo json_encode([
        "status" => "error", 
        "message" => "Lỗi truy vấn CSDL: " . $e->getMessage()
    ]);
}
?>