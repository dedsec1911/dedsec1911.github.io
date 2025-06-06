<?php
header('Content-Type: application/json');

// Example hardcoded update info
$updateInfo = [
    "versionCode" => 5,
    "versionName" => "1.0.5",
    "apkUrl" => "https://yourdomain.com/app-latest.apk"
];

echo json_encode($updateInfo);
