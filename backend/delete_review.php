<?php
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