<?php
// Đường dẫn: BACKEND/get_reviews_admin.php
ini_set('display_errors', 0);
error_reporting(0);

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
}
header("Content-Type: application/json; charset=UTF-8");

include_once 'db.php';

try {
    $query = "
        SELECT r.ReviewID, r.OrderID, r.Rating, r.Comment, r.CreatedAt, p.ProductName, u.FullName, u.Email
        FROM reviews r
        JOIN products p ON r.ProductID = p.ProductID
        JOIN users u ON r.UserID = u.UserID
        ORDER BY r.CreatedAt DESC
    ";
    $stmt = $pdo->query($query);
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "reviews" => $reviews]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>