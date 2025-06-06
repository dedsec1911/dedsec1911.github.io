<?php
header('Content-Type: application/json');

// Example hardcoded update info
$updateInfo = [
    "versionCode" => 2,
    "versionName" => "1.0",
    "apkUrl" => "https://dedsec1911.github.io/app-latest.apk"
];

echo json_encode($updateInfo);
