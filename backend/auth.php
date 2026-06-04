<?php
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

// Lấy dữ liệu JSON từ React gửi lên
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    $email = $data->email;
    $password = $data->password; 

    try {
        // Thay đổi truy vấn: Tìm kiếm theo Email thay vì Username và lấy thêm cột IsVerified
        $stmt = $pdo->prepare("SELECT UserID, FullName, Username, RoleID, IsVerified FROM Users WHERE Email = ? AND Password = ?");
        $stmt->execute([$email, $password]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // 🚨 CHỐT CHẶN BẢO MẬT: Kiểm tra trạng thái xác thực OTP
            if ($user['IsVerified'] == 0) {
                // Nếu IsVerified bằng 0, từ chối cho vào hệ thống
                echo json_encode(["status" => "error", "message" => "Tài khoản chưa được kích hoạt! Vui lòng kiểm tra Email để xác thực mã OTP."]);
            } else {
                // Nếu IsVerified bằng 1, cho phép đăng nhập bình thường
                echo json_encode(["status" => "success", "message" => "Đăng nhập thành công", "user" => $user]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Sai địa chỉ Email hoặc mật khẩu!"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Lỗi hệ thống: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Vui lòng nhập đầy đủ thông tin Email và mật khẩu!"]);
}
?>