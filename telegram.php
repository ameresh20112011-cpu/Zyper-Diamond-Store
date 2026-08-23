<?php

// 🔑 YOUR TELEGRAM BOT TOKEN
$botToken = "8682024840:AAHmPLREIhoxV6EEQC-4wVc9xpM0BRwxDa4";

// 💬 YOUR CHAT ID
$chatId = "8068863783";

// CHECK IF FILE EXISTS
if (!isset($_FILES['photo'])) {
    echo json_encode([
        "success" => false,
        "message" => "No file uploaded"
    ]);
    exit;
}

// GET FILE
$file = $_FILES['photo']['tmp_name'];

// GET CAPTION
$caption = isset($_POST['caption']) ? $_POST['caption'] : "";

// TELEGRAM API URL
$url = "https://api.telegram.org/bot$botToken/sendPhoto";

// DATA TO SEND
$postFields = [
    'chat_id' => $chatId,
    'photo' => new CURLFile($file),
    'caption' => $caption
];

// INIT CURL
$ch = curl_init();

curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type:multipart/form-data"]);
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);

// EXECUTE
$result = curl_exec($ch);

// ERROR CHECK
if ($result === false) {
    echo json_encode([
        "success" => false,
        "message" => curl_error($ch)
    ]);
} else {
    echo $result;
}

curl_close($ch);

?>