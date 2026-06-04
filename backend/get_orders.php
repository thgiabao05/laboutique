<?php
// Đường dẫn: BACKEND/get_orders.php
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

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->UserID)) {
    try {
        // Lấy các đơn hàng của user, sắp xếp mới nhất lên đầu
        $query = "SELECT OrderID, TotalAmount, OrderStatus, CreatedAt FROM orders WHERE UserID = :userId ORDER BY CreatedAt DESC";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':userId', $data->UserID);
        $stmt->execute();

        $orders = array();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Đếm tổng số lượng sản phẩm (chai nước hoa) trong đơn hàng này
            $itemQuery = "SELECT SUM(Quantity) as TotalItems FROM order_items WHERE OrderID = :orderId";
            $itemStmt = $pdo->prepare($itemQuery);
            $itemStmt->bindParam(':orderId', $row['OrderID']);
            $itemStmt->execute();
            $itemRow = $itemStmt->fetch(PDO::FETCH_ASSOC);

            $orders[] = array(
                "OrderID" => $row['OrderID'],
                "TotalAmount" => $row['TotalAmount'],
                "OrderStatus" => $row['OrderStatus'],
                "CreatedAt" => $row['CreatedAt'],
                "TotalItems" => $itemRow['TotalItems'] ? intval($itemRow['TotalItems']) : 0
            );
        }

        http_response_code(200);
        echo json_encode(array("status" => "success", "orders" => $orders));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("status" => "error", "message" => "Lỗi truy vấn: " . $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("status" => "error", "message" => "Thiếu thông tin người dùng."));
}
?>