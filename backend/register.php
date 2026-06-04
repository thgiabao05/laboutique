<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php'; 
require 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->fullName) && !empty($data->username) && !empty($data->email) && !empty($data->password)) {
    
    $fullName = trim($data->fullName);
    $username = trim($data->username);
    $email = trim($data->email);
    $password = trim($data->password);

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "Định dạng Email không hợp lệ!"]);
        exit();
    }

    if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) {
        echo json_encode(["status" => "error", "message" => "Tên đăng nhập từ 3-20 ký tự, không chứa dấu và khoảng trắng!"]);
        exit();
    }

    try {
        // 1. NGHIỆP VỤ PHÂN TÍCH TRẠNG THÁI TÀI KHOẢN
        $checkStmt = $pdo->prepare("SELECT UserID, IsVerified FROM Users WHERE Username = ? OR Email = ?");
        $checkStmt->execute([$username, $email]);
        $existingUser = $checkStmt->fetch(PDO::FETCH_ASSOC);

        $isPendingUser = false;
        $pendingUserId = null;

        if ($existingUser) {
            if ((int)$existingUser['IsVerified'] === 1) {
                // Nếu tài khoản đã xác thực thật rồi thì chặn đứng
                echo json_encode(["status" => "error", "message" => "Tên đăng nhập hoặc Email này đã được sử dụng!"]);
                exit();
            } else {
                // Nếu tài khoản tồn tại nhưng chưa nhập OTP (IsVerified = 0)
                $isPendingUser = true;
                $pendingUserId = $existingUser['UserID'];
            }
        }

        // Mã hóa mật khẩu mới
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        // Tạo mã OTP mới tinh
        $otpCode = rand(100000, 999999);

        // 2. NGHIỆP VỤ GỬI MAIL OTP VIA PHPMAILER
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'truonggiabao2301@gmail.com';       // 👈 Điền Gmail của bạn
        $mail->Password   = 'jegqixhcnryrsohi';        // 👈 Điền Mật khẩu ứng dụng Google
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        $mail->CharSet    = 'UTF-8';

        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );

        $mail->setFrom('your_email@gmail.com', 'La Boutique Support');
        $mail->addAddress($email, $fullName);

        $mail->isHTML(true);
        $mail->Subject = 'XÁC THỰC TÀI KHOẢN - LA BOUTIQUE';
        $mail->Body    = "
            <div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee;'>
                <h2 style='text-align: center; letter-spacing: 2px; color: #111;'>LA BOUTIQUE</h2>
                <p>Xin chào <strong>{$fullName}</strong>,</p>
                <p>Hệ thống nhận được yêu cầu đăng ký tài khoản của bạn. Mã xác thực (OTP) mới của bạn là:</p>
                <div style='text-align: center; margin: 30px 0; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #000;'>
                    {$otpCode}
                </div>
                <p style='font-size: 12px; color: #666; text-align: center;'>Mã xác thực này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
            </div>
        ";

        $mail->send();

        // 3. THỰC THI DATABASE LINH HOẠT
        $defaultAddresses = '[]'; // Khởi tạo chuỗi JSON mảng rỗng cho địa chỉ

        if ($isPendingUser) {
            // Nếu là tài khoản "treo", cập nhật thông tin mới, OTP mới và reset lại Addresses
            $stmt = $pdo->prepare("UPDATE Users SET FullName = ?, Username = ?, Email = ?, Password = ?, OTP = ?, Addresses = ? WHERE UserID = ?");
            $stmt->execute([$fullName, $username, $email, $hashedPassword, $otpCode, $defaultAddresses, $pendingUserId]);
            echo json_encode(["status" => "success", "message" => "Mã OTP mới đã được gửi lại vào email của bạn!"]);
        } else {
            // Nếu là người mới hoàn toàn, chạy lệnh INSERT kèm cột Phone rỗng và Addresses rỗng
            $stmt = $pdo->prepare("INSERT INTO Users (FullName, Username, Email, Password, RoleID, IsVerified, OTP, Phone, Addresses) VALUES (?, ?, ?, ?, 2, 0, ?, '', ?)");
            $stmt->execute([$fullName, $username, $email, $hashedPassword, $otpCode, $defaultAddresses]);
            echo json_encode(["status" => "success", "message" => "Mã OTP đã được gửi đến email của bạn!"]);
        }

    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => "Không thể gửi email OTP. Lỗi: " . $mail->ErrorInfo]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Lỗi xử lý tài khoản: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Vui lòng điền đầy đủ thông tin đăng ký!"]);
}
?>