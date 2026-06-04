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
// Đường dẫn: BACKEND/save_product.php
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

// Nhận dữ liệu từ FormData (Lưu ý: upload file dùng FormData, không dùng JSON)
$productId = isset($_POST['ProductID']) ? intval($_POST['ProductID']) : 0;
$productName = isset($_POST['ProductName']) ? trim($_POST['ProductName']) : '';
$price = isset($_POST['Price']) ? floatval($_POST['Price']) : 0;
$categoryId = isset($_POST['CategoryID']) ? intval($_POST['CategoryID']) : 1;
$imageUrl = isset($_POST['ImageURL']) ? trim($_POST['ImageURL']) : '';

if (empty($productName)) {
    echo json_encode(["status" => "error", "message" => "Tên sản phẩm không được để trống."]);
    exit;
}

// Xử lý Upload Ảnh (Nếu có chọn file)
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = 'uploads/';
    // Tạo thư mục nếu chưa có
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    // Đổi tên file để không bị trùng lặp
    $fileName = time() . '_' . basename($_FILES['image']['name']);
    $targetFilePath = $uploadDir . $fileName;
    
    if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFilePath)) {
        // Lưu đường dẫn ảnh vào Database
        $imageUrl = 'https://laboutique.free.je/backend/' . $targetFilePath;
    } else {
        echo json_encode(["status" => "error", "message" => "Lỗi khi lưu file ảnh vào hệ thống."]);
        exit;
    }
}

try {
    if ($productId === 0) {
        // THÊM SẢN PHẨM MỚI (INSERT)
        $query = "INSERT INTO products (ProductName, Price, ImageURL, CategoryID) VALUES (:name, :price, :image, :cat)";
        $stmt = $pdo->prepare($query);
    } else {
        // SỬA SẢN PHẨM (UPDATE)
        $query = "UPDATE products SET ProductName = :name, Price = :price, ImageURL = :image, CategoryID = :cat WHERE ProductID = :id";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':id', $productId);
    }

    $stmt->bindParam(':name', $productName);
    $stmt->bindParam(':price', $price);
    $stmt->bindParam(':image', $imageUrl);
    $stmt->bindParam(':cat', $categoryId);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Lưu thông tin sản phẩm thành công!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Lưu thất bại do lỗi CSDL."]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Lỗi CSDL: " . $e->getMessage()]);
}
?>