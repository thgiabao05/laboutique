<?php
// Đường dẫn: BACKEND/update_user_role.php
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

if (!empty($data->UserID) && !empty($data->Role)) {
    try {
        $query = "UPDATE users SET Role = :role WHERE UserID = :id";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':role', $data->Role);
        $stmt->bindParam(':id', $data->UserID);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Cập nhật quyền thành công."]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Không thể cập nhật."]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Thiếu thông tin phân quyền."]);
}
?>