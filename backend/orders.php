<?php
// BỘ KHIÊN CHỐNG LỖI CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'db.php'; // Kết nối PDO đến Docker port 3326

try {
    // Truy vấn lấy danh sách đơn hàng, sắp xếp đơn mới nhất lên đầu
    // Nếu bảng Orders của bạn dùng cột khác, hãy chỉnh lại tên cột cho khớp
    $stmt = $pdo->prepare("SELECT OrderID, UserID, TotalAmount, Status, OrderDate FROM Orders ORDER BY OrderID DESC");
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => $orders
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Lỗi lấy dữ liệu đơn hàng: " . $e->getMessage()
    ]);
}
?>