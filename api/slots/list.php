<?php
require __DIR__ . '/../config/db.php';
require __DIR__ . '/../lib/helpers.php';

require_login();

$sql = "SELECT s.id, s.slot_date, s.start_time, s.end_time, s.status,
               sh.title AS show_title, m.name AS booked_by_name
        FROM slots s
        JOIN shows sh ON sh.id = s.show_id
        LEFT JOIN members m ON m.id = s.booked_by
        ORDER BY s.slot_date, s.start_time";

$result = mysqli_query($conn, $sql);
$slots = [];
while ($row = mysqli_fetch_assoc($result)) {
    $slots[] = $row;
}

respond(['slots' => $slots]);
