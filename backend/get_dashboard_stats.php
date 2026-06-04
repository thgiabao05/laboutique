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
// Đường dẫn: BACKEND/get_dashboard_stats.php
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
    // 1. Tính tổng doanh thu (Chỉ cộng tiền của những đơn đã giao thành công)
    $revenueStmt = $pdo->query("SELECT SUM(TotalAmount) as TotalRevenue FROM orders WHERE OrderStatus = 'Completed'");
    $revenueRow = $revenueStmt->fetch(PDO::FETCH_ASSOC);
    $totalRevenue = $revenueRow['TotalRevenue'] ? floatval($revenueRow['TotalRevenue']) : 0;

    // 2. Đếm số đơn hàng mới (Chờ xác nhận)
    $newOrdersStmt = $pdo->query("SELECT COUNT(*) as NewOrders FROM orders WHERE OrderStatus = 'Pending'");
    $newOrdersRow = $newOrdersStmt->fetch(PDO::FETCH_ASSOC);
    $newOrders = intval($newOrdersRow['NewOrders']);

    // 3. Đếm tổng số sản phẩm trong kho
    // Dùng try-catch phòng trường hợp bảng products chưa có dữ liệu
    $totalProducts = 0;
    try {
        $productStmt = $pdo->query("SELECT COUNT(*) as TotalProducts FROM products");
        $productRow = $productStmt->fetch(PDO::FETCH_ASSOC);
        $totalProducts = intval($productRow['TotalProducts']);
    } catch (Exception $e) {
        $totalProducts = 0;
    }

    $stats = array(
        "totalRevenue" => $totalRevenue,
        "newOrders" => $newOrders,
        "totalProducts" => $totalProducts
    );

    http_response_code(200);
    echo json_encode(["status" => "success", "stats" => $stats]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Lỗi lấy thống kê: " . $e->getMessage()]);
}
?>