<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'db.php';

$data = json_decode(file_get_contents("php://input"));

// 💥 THAY ĐỔI: Chuyển sang tìm bằng userId thay vì email
if (!empty($data->userId)) {
    try {
        $stmt = $pdo->prepare("SELECT UserID, FullName, Username, Email, Phone, Address FROM Users WHERE UserID = ?");
        $stmt->execute([$data->userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            echo json_encode(["status" => "success", "data" => $user]);
        } else {
            echo json_encode(["status" => "error", "message" => "Không tìm thấy thông tin tài khoản!"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Lỗi hệ thống: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Thiếu thông tin xác thực (UserID)!"]);
}
?>