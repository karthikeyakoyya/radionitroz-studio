<?php
require __DIR__ . '/../config/db.php';
require __DIR__ . '/../lib/helpers.php';

$member = require_login();

if ($member['role'] === 'admin') {
    $sql = "SELECT sub.id, sub.content_title, sub.content_notes, sub.status,
                   sub.submitted_at, m.name AS member_name
            FROM submissions sub
            JOIN members m ON m.id = sub.member_id
            ORDER BY sub.submitted_at DESC";
    $result = mysqli_query($conn, $sql);
} else {
    $stmt = mysqli_prepare(
        $conn,
        "SELECT id, content_title, content_notes, status, submitted_at
         FROM submissions WHERE member_id = ? ORDER BY submitted_at DESC"
    );
    mysqli_stmt_bind_param($stmt, 'i', $member['id']);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
}

$submissions = [];
while ($row = mysqli_fetch_assoc($result)) {
    $submissions[] = $row;
}

respond(['submissions' => $submissions]);
