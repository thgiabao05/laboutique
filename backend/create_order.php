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
// Đường dẫn: BACKEND/create_order.php
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

if (!empty($data->UserID) && !empty($data->CartItems)) {
    try {
        $pdo->beginTransaction();

        // Tạo mã đơn hàng duy nhất, tích hợp mã định danh hệ thống
        $orderId = "ORD-DH52200380-" . date("YmdHis") . rand(10, 99);

        // 1. Ghi vào bảng orders
        $queryOrder = "INSERT INTO orders (OrderID, UserID, Phone, Address, TotalAmount, PaymentMethod) VALUES (?, ?, ?, ?, ?, 'COD')";
        $stmtOrder = $pdo->prepare($queryOrder);
        $stmtOrder->execute([$orderId, $data->UserID, $data->Phone, $data->Address, $data->TotalAmount]);

        // 2. Ghi vào bảng order_items
        $queryItem = "INSERT INTO order_items (OrderID, ProductID, Title, Price, Quantity) VALUES (?, ?, ?, ?, ?)";
        $stmtItem = $pdo->prepare($queryItem);
        foreach ($data->CartItems as $item) {
            $stmtItem->execute([$orderId, $item->id, $item->title, $item->price, $item->quantity]);
        }

        $pdo->commit();

        // ========================================================
        // TÍCH HỢP GỬI EMAIL HÓA ĐƠN SAU KHI LƯU CSDL
        // ========================================================
        try {
            // Lấy Tên và Email khách hàng
            $stmtUser = $pdo->prepare("SELECT FullName, Email FROM users WHERE UserID = ?");
            $stmtUser->execute([$data->UserID]);
            $userData = $stmtUser->fetch(PDO::FETCH_ASSOC);

            if ($userData && !empty($userData['Email'])) {
                // Nhúng template hóa đơn và PHPMailer (sửa đường dẫn PHPMailer nếu cần)
                require_once 'invoice_template.php';
                require_once 'PHPMailer/src/Exception.php';
                require_once 'PHPMailer/src/PHPMailer.php';
                require_once 'PHPMailer/src/SMTP.php';
                
                $mail = new PHPMailer\PHPMailer\PHPMailer(true);

                $mail->isSMTP();
                $mail->Host       = 'smtp.gmail.com'; 
                $mail->SMTPAuth   = true;
                $mail->Username   = 'truonggiabao2301@gmail.com'; // SỬA: Điền email của bạn
                $mail->Password   = 'jegqixhcnryrsohi';       // SỬA: Điền mật khẩu ứng dụng
                $mail->SMTPSecure = 'tls';
                $mail->Port       = 587;
                $mail->CharSet    = 'UTF-8';

                $mail->setFrom('truonggiabao2301@gmail.com', 'La Boutique'); // SỬA: Điền email của bạn
                $mail->addAddress($userData['Email'], $userData['FullName']);
                
                $mail->isHTML(true);
                $mail->Subject = 'Xác nhận đơn hàng ' . $orderId . ' thành công - La Boutique';
                
                // Gọi hàm dựng HTML hóa đơn
                $mail->Body = createInvoiceEmail(
                    $userData['FullName'], 
                    $orderId, 
                    $data->TotalAmount, 
                    $data->CartItems, 
                    $data->Address
                );

                $mail->send();
            }
        } catch (Exception $e) {
            // Lỗi email sẽ được ghi log, không làm văng luồng của hệ thống
            error_log("Lỗi gửi email hóa đơn: " . $e->getMessage()); 
        }
        // ========================================================

        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Đặt hàng thành công!", "orderId" => $orderId]);

    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Lỗi hệ thống: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Dữ liệu không hợp lệ."]);
}
?>