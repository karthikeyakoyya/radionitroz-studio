<?php
require __DIR__ . '/../config/db.php';
require __DIR__ . '/../lib/helpers.php';

$admin = require_admin();
require_csrf();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'Method not allowed'], 405);
}

$input = json_input();
$submissionId = (int)($input['submission_id'] ?? 0);
$decision = $input['decision'] ?? '';

if ($submissionId <= 0 || !in_array($decision, ['approved', 'rejected'], true)) {
    respond(['error' => 'submission_id and a valid decision are required'], 422);
}

$stmt = mysqli_prepare(
    $conn,
    'UPDATE submissions SET status = ?, reviewed_by = ?, reviewed_at = NOW()
     WHERE id = ? AND status = "pending"'
);
mysqli_stmt_bind_param($stmt, 'sii', $decision, $admin['id'], $submissionId);
mysqli_stmt_execute($stmt);
$affected = mysqli_stmt_affected_rows($stmt);
mysqli_stmt_close($stmt);

if ($affected === 0) {
    respond(['error' => 'Submission not found or already reviewed'], 409);
}

respond(['message' => "Submission $decision"]);
