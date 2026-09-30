<?php
require __DIR__ . '/../config/db.php';
require __DIR__ . '/../lib/helpers.php';

$member = require_login();
require_csrf();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'Method not allowed'], 405);
}

$input = json_input();
$title = trim($input['content_title'] ?? '');
$notes = trim($input['content_notes'] ?? '');
$slotId = isset($input['slot_id']) ? (int)$input['slot_id'] : null;

if ($title === '') {
    respond(['error' => 'content_title is required'], 422);
}

$stmt = mysqli_prepare(
    $conn,
    'INSERT INTO submissions (member_id, slot_id, content_title, content_notes) VALUES (?, ?, ?, ?)'
);
mysqli_stmt_bind_param($stmt, 'iiss', $member['id'], $slotId, $title, $notes);
mysqli_stmt_execute($stmt);
$newId = mysqli_insert_id($conn);
mysqli_stmt_close($stmt);

respond(['id' => $newId, 'message' => 'Submission received'], 201);
