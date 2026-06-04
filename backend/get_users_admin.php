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
// Đường dẫn: BACKEND/get_users_admin.php
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
    // Tự động kiểm tra và tạo cột Role nếu Database của bạn chưa có
    $checkRole = $pdo->query("SHOW COLUMNS FROM users LIKE 'Role'");
    if ($checkRole->rowCount() == 0) {
        $pdo->exec("ALTER TABLE users ADD COLUMN Role VARCHAR(20) DEFAULT 'user'");
    }

    // Lấy danh sách, đưa Admin và Staff lên trên cùng, khách hàng ở dưới
    $query = "SELECT UserID, FullName, Email, Phone, Role FROM users ORDER BY FIELD(Role, 'admin', 'staff', 'user'), UserID DESC";
    $stmt = $pdo->prepare($query);
    $stmt->execute();

    $users = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $users[] = array(
            "UserID" => intval($row['UserID']),
            "FullName" => $row['FullName'],
            "Email" => $row['Email'],
            "Phone" => $row['Phone'],
            "Role" => $row['Role'] ? $row['Role'] : 'user'
        );
    }

    http_response_code(200);
    echo json_encode(["status" => "success", "users" => $users]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Lỗi truy vấn: " . $e->getMessage()]);
}
?>