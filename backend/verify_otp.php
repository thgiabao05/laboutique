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
// BỘ KHIÊN CHỐNG LỖI CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'db.php'; // Gọi kết nối database

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->otp)) {
    try {
        // Kiểm tra xem Email và OTP có khớp không
        $stmt = $pdo->prepare("SELECT UserID FROM Users WHERE Email = ? AND OTP = ?");
        $stmt->execute([$data->email, $data->otp]);
        
        if ($stmt->rowCount() > 0) {
            // Khớp mã -> Kích hoạt tài khoản (IsVerified = 1) và xóa mã OTP đi cho an toàn
            $updateStmt = $pdo->prepare("UPDATE Users SET IsVerified = 1, OTP = NULL WHERE Email = ?");
            $updateStmt->execute([$data->email]);
            
            echo json_encode(["status" => "success", "message" => "Xác thực thành công! Đang chuyển hướng..."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Mã OTP không chính xác hoặc đã hết hạn!"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Lỗi Database: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Vui lòng nhập đầy đủ mã OTP!"]);
}
?>