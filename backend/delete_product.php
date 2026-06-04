<?php
// Đường dẫn: BACKEND/delete_product.php
ini_set('display_errors', 0);
error_reporting(0);

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
}
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) header("Access-Control-Allow-Methods: POST, OPTIONS");
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit(0);
}
header("Content-Type: application/json; charset=UTF-8");

include_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->ProductID)) {
    try {
        $stmt = $pdo->prepare("DELETE FROM products WHERE ProductID = :id");
        $stmt->bindParam(':id', $data->ProductID);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Đã xóa sản phẩm thành công."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Không thể xóa sản phẩm."]);
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Lỗi hệ thống: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Thiếu mã sản phẩm."]);
}
?>