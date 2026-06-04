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
// Tắt hoàn toàn việc in lỗi HTML của WAMP để không làm nghẽn bộ đọc JSON của ReactJS
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

if (!empty($data->Username) && !empty($data->Password)) {
    try {
        // Sử dụng SELECT * để tự động tương thích với mọi cột, bao gồm cả cột Role
        $query = "SELECT * FROM users WHERE Email = :email LIMIT 0,1";
        $stmt = $pdo->prepare($query); 
        
        $stmt->bindParam(':email', $data->Username);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (password_verify($data->Password, $row['Password'])) { 
                
                // CƠ CHẾ TỰ ĐỘNG NHẬN DIỆN: Kiểm tra xem Database đang dùng tên cột nào để lấy dữ liệu
                $rawAddress = "";
                if (array_key_exists('Addresses', $row)) {
                    $rawAddress = $row['Addresses'];
                } elseif (array_key_exists('Address', $row)) {
                    $rawAddress = $row['Address'];
                }

                // Giải mã mảng địa chỉ gửi về cho ReactJS
                $addressesArray = json_decode($rawAddress);
                if (!is_array($addressesArray)) {
                    $addressesArray = !empty($rawAddress) ? array($rawAddress) : array();
                }

                // Kiểm tra sự tồn tại của cột Phone
                $phone = isset($row['Phone']) ? $row['Phone'] : "";

                // ĐÓNG GÓI DỮ LIỆU BAO GỒM CẢ ROLE ĐỂ GỬI VỀ FRONTEND
                $user_auth = array(
                    "UserID" => intval($row['UserID']),
                    "FullName" => $row['FullName'],
                    "Email" => $row['Email'],
                    "Username" => $row['Email'], 
                    "Phone" => $phone,
                    "Addresses" => $addressesArray,
                    "Role" => isset($row['Role']) ? $row['Role'] : 'user' // <- Bổ sung dòng cực kỳ quan trọng này
                );

                http_response_code(200);
                echo json_encode(array("message" => "Đăng nhập thành công.", "user" => $user_auth));
            } else {
                http_response_code(401);
                echo json_encode(array("message" => "Mật khẩu không chính xác."));
            }
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Tài khoản không tồn tại."));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Lỗi kết nối CSDL: " . $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Vui lòng nhập đủ thông tin."));
}
?>