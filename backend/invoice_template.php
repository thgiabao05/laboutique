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
// Đường dẫn: BACKEND/invoice_template.php

function createInvoiceEmail($customerName, $orderID, $totalAmount, $cartItems, $address) {
    $itemRows = "";
    foreach ($cartItems as $item) {
        $priceFormatted = number_format($item->price, 0, ',', '.') . " ₫";
        $subtotalFormatted = number_format($item->price * $item->quantity, 0, ',', '.') . " ₫";
        
        $itemRows .= "
        <tr style='border-bottom: 1px solid #eee;'>
            <td style='padding: 12px; font-size: 14px; color: #333;'>{$item->title}</td>
            <td style='padding: 12px; font-size: 14px; color: #666; text-align: center;'>{$item->quantity}</td>
            <td style='padding: 12px; font-size: 14px; color: #666; text-align: right;'>{$priceFormatted}</td>
            <td style='padding: 12px; font-size: 14px; color: #111; text-align: right; font-weight: bold;'>{$subtotalFormatted}</td>
        </tr>";
    }

    $totalFormatted = number_format($totalAmount, 0, ',', '.') . " ₫";
    $dateNow = date('d/m/Y H:i');

    return "
    <div style='font-family: \"Helvetica Neue\", Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e1e1e1; padding: 30px; background-color: #ffffff;'>
        <div style='text-align: center; border-bottom: 2px solid #111; padding-bottom: 20px; margin-bottom: 30px;'>
            <h1 style='margin: 0; font-weight: 300; letter-spacing: 6px; font-size: 26px; color: #111;'>LA BOUTIQUE</h1>
            <p style='margin: 5px 0 0 0; font-size: 11px; color: #888; letter-spacing: 2px; text-transform: uppercase;'>Hóa đơn xác nhận đơn hàng</p>
        </div>
        
        <div style='margin-bottom: 25px;'>
            <p style='margin: 0 0 10px 0; font-size: 15px;'>Chào <strong>{$customerName}</strong>,</p>
            <p style='margin: 0; font-size: 14px; color: #555; line-height: 1.5;'>Cảm ơn bạn đã lựa chọn mua sắm tại cửa hàng của chúng tôi. Đơn hàng của bạn đã được tiếp nhận thành công và đang trong quá trình chuẩn bị.</p>
        </div>

        <div style='background-color: #f9f9f9; padding: 15px; margin-bottom: 30px; font-size: 13px; line-height: 1.6; border-left: 3px solid #111;'>
            <div style='display: flex; justify-content: space-between;'>
                <span><strong>Mã đơn hàng:</strong> #{$orderID}</span>
            </div>
            <div><strong>Thời gian đặt:</strong> {$dateNow}</div>
            <div><strong>Địa chỉ nhận:</strong> {$address}</div>
        </div>

        <table style='width: 100%; border-collapse: collapse; margin-bottom: 30px;'>
            <thead>
                <tr style='background-color: #111; color: #fff;'>
                    <th style='padding: 12px; text-align: left; font-size: 12px; letter-spacing: 1px;'>SẢN PHẨM</th>
                    <th style='padding: 12px; text-align: center; font-size: 12px; letter-spacing: 1px; width: 60px;'>SL</th>
                    <th style='padding: 12px; text-align: right; font-size: 12px; letter-spacing: 1px; width: 100px;'>ĐƠN GIÁ</th>
                    <th style='padding: 12px; text-align: right; font-size: 12px; letter-spacing: 1px; width: 100px;'>TỔNG</th>
                </tr>
            </thead>
            <tbody>
                {$itemRows}
            </tbody>
        </table>

        <div style='text-align: right; margin-bottom: 40px; border-top: 1px solid #111; padding-top: 15px;'>
            <span style='font-size: 14px; color: #555; text-transform: uppercase; letter-spacing: 1px;'>Thành tiền:</span>
            <span style='font-size: 22px; font-weight: bold; color: #111; margin-left: 10px;'>{$totalFormatted}</span>
        </div>
    </div>";
}
?>