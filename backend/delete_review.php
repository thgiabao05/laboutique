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
// Đường dẫn: BACKEND/delete_review.php
ini_set('display_errors', 0);
error_reporting(0);

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
}
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) header("Access-Control-Allow-Methods: POST, OPTIONS");
    exit(0);
}
header("Content-Type: application/json; charset=UTF-8");

include_once 'db.php';
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->ReviewID)) {
    try {
        $stmt = $pdo->prepare("DELETE FROM reviews WHERE ReviewID = :id");
        $stmt->execute([':id' => $data->ReviewID]);
        echo json_encode(["status" => "success", "message" => "Đã xóa đánh giá thành công."]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>