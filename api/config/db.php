<?php
// Database connection. Copy this file to db.local.php on your server and
// fill in real credentials. db.local.php is gitignored.

$host     = getenv('DB_HOST') ?: 'localhost';
$user     = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASS') ?: '';
$database = getenv('DB_NAME') ?: 'radionitroz_studio';

$conn = mysqli_connect($host, $user, $password, $database);

if (!$conn) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

mysqli_set_charset($conn, 'utf8mb4');
