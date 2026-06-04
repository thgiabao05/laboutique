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
ini_set('display_errors', 0);
error_reporting(0);

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit(0);
}
header("Content-Type: application/json; charset=UTF-8");

include_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->UserID)) {
    try {
        // Tự động kiểm tra xem bảng đang dùng cột Address hay Addresses để ghi dữ liệu cho đúng
        $stmtCheck = $pdo->prepare("SHOW COLUMNS FROM users LIKE 'Addresses'");
        $stmtCheck->execute();
        $columnName = ($stmtCheck->rowCount() > 0) ? 'Addresses' : 'Address';

        // Mã hóa mảng tối đa 3 địa chỉ thành chuỗi JSON để lưu vào 1 ô duy nhất
        $addressesJson = json_encode($data->Addresses, JSON_UNESCAPED_UNICODE);

        $query = "UPDATE users SET Phone = :phone, {$columnName} = :address WHERE UserID = :id";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':phone', $data->Phone);
        $stmt->bindParam(':address', $addressesJson);
        $stmt->bindParam(':id', $data->UserID);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("status" => "success", "message" => "Cập nhật dữ liệu thành công."));
        } else {
            http_response_code(500);
            echo json_encode(array("status" => "error", "message" => "Không thể cập nhật dữ liệu."));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("status" => "error", "message" => $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("status" => "error", "message" => "Dữ liệu không đầy đủ."));
}
?>