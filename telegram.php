<?php

header("Content-Type: application/json; charset=UTF-8");

// =====================================================
// TELEGRAM CONFIGURATION
// =====================================================

// IMPORTANT:
// Put your NEW Telegram bot token here.
// DO NOT upload this PHP file to GitHub.
$botToken = "8682024840:AAHmPLREIhoxV6EEQC-4wVc9xpM0BRwxDa4";

$chatId = "8068863783";


// =====================================================
// BASIC SETTINGS
// =====================================================

$orderFile = __DIR__ . "/order_number.txt";


// =====================================================
// CHECK REQUEST
// =====================================================

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    echo json_encode([
        "success" => false,
        "message" => "Invalid request method"
    ]);

    exit;
}


// =====================================================
// CHECK RECEIPT
// =====================================================

if (!isset($_FILES["photo"])) {

    echo json_encode([
        "success" => false,
        "message" => "No receipt uploaded"
    ]);

    exit;
}


if ($_FILES["photo"]["error"] !== UPLOAD_ERR_OK) {

    echo json_encode([
        "success" => false,
        "message" => "Receipt upload error"
    ]);

    exit;
}


// =====================================================
// CHECK FILE
// =====================================================

$file = $_FILES["photo"]["tmp_name"];

if (!file_exists($file)) {

    echo json_encode([
        "success" => false,
        "message" => "Uploaded file not found"
    ]);

    exit;
}


// =====================================================
// GET CUSTOMER DATA
// =====================================================

$package = isset($_POST["package"])
    ? trim($_POST["package"])
    : "Not provided";

$uid = isset($_POST["uid"])
    ? trim($_POST["uid"])
    : "Not provided";

$name = isset($_POST["name"])
    ? trim($_POST["name"])
    : "Not provided";

$email = isset($_POST["email"])
    ? trim($_POST["email"])
    : "Not provided";

$phone = isset($_POST["phone"])
    ? trim($_POST["phone"])
    : "Not provided";

$caption = isset($_POST["caption"])
    ? trim($_POST["caption"])
    : "";


// =====================================================
// GENERATE ORDER NUMBER
// =====================================================

if (!file_exists($orderFile)) {

    file_put_contents(
        $orderFile,
        "0",
        LOCK_EX
    );
}


// Open order number file
$fp = fopen($orderFile, "c+");

if (!$fp) {

    echo json_encode([
        "success" => false,
        "message" => "Cannot open order number file"
    ]);

    exit;
}


// Lock file so two customers cannot get same number
if (!flock($fp, LOCK_EX)) {

    fclose($fp);

    echo json_encode([
        "success" => false,
        "message" => "Cannot lock order number file"
    ]);

    exit;
}


// Read current number
rewind($fp);

$currentNumber = trim(
    stream_get_contents($fp)
);

if ($currentNumber === "") {
    $currentNumber = 0;
}

$currentNumber = intval($currentNumber);


// Increase number
$newNumber = $currentNumber + 1;


// Save new number
ftruncate($fp, 0);
rewind($fp);

fwrite(
    $fp,
    (string)$newNumber
);

fflush($fp);


// Release lock
flock($fp, LOCK_UN);

fclose($fp);


// Format:
//
// 1      = 00001
// 12     = 00012
// 123    = 00123
// 1234   = 01234
// 12345  = 12345

$orderNumber = str_pad(
    $newNumber,
    5,
    "0",
    STR_PAD_LEFT
);


// =====================================================
// TELEGRAM CAPTION
// =====================================================

$telegramCaption =
"💎 ZYPER DIAMOND STORE\n\n" .

"🧾 ORDER NO: " . $orderNumber . "\n\n" .

"🎮 PACKAGE:\n" .
$package . "\n\n" .

"🆔 UID:\n" .
$uid . "\n\n" .

"👤 NAME:\n" .
$name . "\n\n" .

"📧 EMAIL:\n" .
$email . "\n\n" .

"📱 PHONE:\n" .
$phone . "\n\n" .

"📌 STATUS: PENDING";


// If custom caption exists, append it
if ($caption !== "") {

    $telegramCaption .=
        "\n\n" .
        $caption;
}


// =====================================================
// TELEGRAM API
// =====================================================

$url =
"https://api.telegram.org/bot" .
$botToken .
"/sendPhoto";


// =====================================================
// SEND PHOTO
// =====================================================

$postFields = [

    "chat_id" => $chatId,

    "photo" => new CURLFile(
        $file,
        mime_content_type($file),
        $_FILES["photo"]["name"]
    ),

    "caption" => $telegramCaption

];


// =====================================================
// CURL
// =====================================================

$ch = curl_init();

curl_setopt(
    $ch,
    CURLOPT_URL,
    $url
);

curl_setopt(
    $ch,
    CURLOPT_RETURNTRANSFER,
    true
);

curl_setopt(
    $ch,
    CURLOPT_POST,
    true
);

curl_setopt(
    $ch,
    CURLOPT_POSTFIELDS,
    $postFields
);

curl_setopt(
    $ch,
    CURLOPT_TIMEOUT,
    30
);


// =====================================================
// EXECUTE
// =====================================================

$result = curl_exec($ch);


// =====================================================
// CURL ERROR
// =====================================================

if ($result === false) {

    $error = curl_error($ch);

    curl_close($ch);

    echo json_encode([

        "success" => false,

        "message" =>
            "Telegram connection failed: " .
            $error

    ]);

    exit;
}


// HTTP STATUS
$httpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);

curl_close($ch);


// =====================================================
// TELEGRAM RESPONSE
// =====================================================

$data = json_decode(
    $result,
    true
);


// Telegram failed
if (
    $httpCode !== 200 ||
    !isset($data["ok"]) ||
    $data["ok"] !== true
) {

    echo json_encode([

        "success" => false,

        "message" =>
            "Telegram rejected the receipt",

        "telegram_response" => $data,

        "order_number" => $orderNumber

    ]);

    exit;
}


// =====================================================
// SUCCESS
// =====================================================

echo json_encode([

    "success" => true,

    "message" =>
        "Receipt sent successfully",

    "order_number" =>
        $orderNumber

]);

?>
