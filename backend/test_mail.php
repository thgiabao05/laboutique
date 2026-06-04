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
// Khai báo sử dụng các class của PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Nhúng các file cốt lõi của thư viện vào
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

// Khởi tạo đối tượng PHPMailer
$mail = new PHPMailer(true);

try {
    // 1. Cấu hình máy chủ SMTP của Google
    $mail->isSMTP();
    
    // BỘ KHIÊN VƯỢT RÀO SSL CỦA WAMP (Phải đặt ngay đây)
    $mail->SMTPOptions = array(
        'ssl' => array(
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        )
    );

    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    
    // BẠN CHỈ CẦN THAY ĐÚNG 2 DÒNG EMAIL NÀY:
    $mail->Username   = 'truonggiabao2301@gmail.com'; 
    $mail->Password   = 'jegqixhcnryrsohi'; // Pass 16 ký tự viết liền của bạn
    
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->CharSet    = 'UTF-8';

    // 2. Thông tin người gửi và người nhận
    $mail->setFrom('truonggiabao2301@gmail.com', 'La Boutique Admin');
    $mail->addAddress('truonggiabao2301@gmail.com', 'Test User'); // Gửi tự test cho chính mình

    // 3. Nội dung Email
    $mail->isHTML(true);
    $mail->Subject = 'Xác thực tài khoản La Boutique';
    $mail->Body    = '
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #111;">Chào mừng đến với La Boutique!</h2>
            <p>Đây là email kiểm tra hệ thống. Mã OTP xác nhận của bạn là: <b style="font-size: 20px; color: red;">123456</b></p>
        </div>
    ';

    // 4. Lệnh gửi
    $mail->send();
    echo 'Thành công! Email đã được gửi đi. Hãy kiểm tra hộp thư của bạn nhé!';
} catch (Exception $e) {
    echo "Lỗi: Không thể gửi mail. Chi tiết: {$mail->ErrorInfo}";
}
?>