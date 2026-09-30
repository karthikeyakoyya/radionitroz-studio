<?php
require __DIR__ . '/../config/db.php';
require __DIR__ . '/../lib/helpers.php';

$member = require_login();
require_csrf();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'Method not allowed'], 405);
}

$input = json_input();
$slotId = (int)($input['slot_id'] ?? 0);

if ($slotId <= 0) {
    respond(['error' => 'slot_id is required'], 422);
}

// Only claim a slot that is currently open, to avoid a race where two
// members book the same slot at once.
$stmt = mysqli_prepare(
    $conn,
    "UPDATE slots SET booked_by = ?, status = 'booked' WHERE id = ? AND status = 'open'"
);
mysqli_stmt_bind_param($stmt, 'ii', $member['id'], $slotId);
mysqli_stmt_execute($stmt);
$affected = mysqli_stmt_affected_rows($stmt);
mysqli_stmt_close($stmt);

if ($affected === 0) {
    respond(['error' => 'Slot is no longer open'], 409);
}

respond(['message' => 'Slot booked']);
