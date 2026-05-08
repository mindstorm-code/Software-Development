<?php
// POST /api/upload/image.php — upload image to Supabase Storage, return public URL
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();
require_method('POST');

require_auth();

$bucket  = $_POST['bucket']  ?? 'family-os';
$folder  = $_POST['folder']  ?? 'uploads';

if (empty($_FILES['file'])) error('No file uploaded');

$file    = $_FILES['file'];
$allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

if (!in_array($file['type'], $allowed)) error('Invalid file type. Only JPG, PNG, GIF, WEBP allowed.');
if ($file['size'] > 10 * 1024 * 1024) error('File too large. Max 10MB.');

$ext      = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = $folder . '/' . uniqid() . '_' . time() . '.' . strtolower($ext);
$data     = file_get_contents($file['tmp_name']);

// Upload to Supabase Storage
$url = rtrim(SUPABASE_URL, '/') . '/storage/v1/object/' . $bucket . '/' . $filename;
$ch  = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $data,
    CURLOPT_HTTPHEADER     => [
        'apikey: '             . SUPABASE_SERVICE_KEY,
        'Authorization: Bearer ' . SUPABASE_SERVICE_KEY,
        'Content-Type: '       . $file['type'],
        'x-upsert: true',
    ],
    CURLOPT_TIMEOUT        => 30,
]);

$response  = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code !== 200) {
    error('Upload failed: ' . $response, 500);
}

$public_url = rtrim(SUPABASE_URL, '/') . '/storage/v1/object/public/' . $bucket . '/' . $filename;
success(['url' => $public_url, 'path' => $filename]);
