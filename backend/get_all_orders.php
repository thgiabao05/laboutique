<?php
// Đường dẫn: BACKEND/get_all_orders.php
ini_set('display_errors', 0);
error_reporting(0);

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

include_once 'db.php';

try {
    // Lấy toàn bộ đơn hàng, sắp xếp đơn mới nhất lên đầu. Kết hợp lấy thêm tên Khách hàng.
    $query = "
        SELECT o.OrderID, o.UserID, o.TotalAmount, o.OrderStatus, o.CreatedAt, o.Phone, o.Address, u.FullName 
        FROM orders o
        LEFT JOIN users u ON o.UserID = u.UserID
        ORDER BY o.CreatedAt DESC
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode(["status" => "success", "orders" => $orders]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Lỗi CSDL: " . $e->getMessage()]);
}
?>