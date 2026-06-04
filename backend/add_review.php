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
// Đường dẫn: BACKEND/add_review.php
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

if (!empty($data->OrderID) && !empty($data->ProductID) && !empty($data->UserID) && !empty($data->Rating)) {
    try {
        // Kiểm tra xem khách đã đánh giá sản phẩm này cho đơn hàng này chưa
        $check = $pdo->prepare("SELECT ReviewID FROM reviews WHERE OrderID = :oid AND ProductID = :pid AND UserID = :uid");
        $check->execute([':oid' => $data->OrderID, ':pid' => $data->ProductID, ':uid' => $data->UserID]);
        if ($check->fetch()) {
            echo json_encode(["status" => "error", "message" => "Bạn đã đánh giá sản phẩm này rồi!"]);
            exit;
        }

        $query = "INSERT INTO reviews (OrderID, ProductID, UserID, Rating, Comment) VALUES (:oid, :pid, :uid, :rating, :comment)";
        $stmt = $pdo->prepare($query);
        $stmt->execute([
            ':oid' => $data->OrderID,
            ':pid' => $data->ProductID,
            ':uid' => $data->UserID,
            ':rating' => $data->Rating,
            ':comment' => $data->Comment ?? ''
        ]);

        echo json_encode(["status" => "success", "message" => "Cảm ơn bạn đã gửi đánh giá!"]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Lỗi hệ thống: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Thiếu thông tin đánh giá."]);
}
?>