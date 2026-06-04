<?php
// Đường dẫn: BACKEND/update_user_info.php
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

if (!empty($data->UserID)) {
    try {
        // Cập nhật Họ Tên, Email và Số điện thoại (Bỏ qua mật khẩu và quyền)
        $query = "UPDATE users SET FullName = :name, Email = :email, Phone = :phone WHERE UserID = :id";
        $stmt = $pdo->prepare($query);
        
        $stmt->bindParam(':name', $data->FullName);
        $stmt->bindParam(':email', $data->Email);
        $stmt->bindParam(':phone', $data->Phone);
        $stmt->bindParam(':id', $data->UserID);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Cập nhật thông tin người dùng thành công!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Không có thay đổi nào được lưu."]);
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Lỗi CSDL: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Thiếu mã ID người dùng."]);
}
?>