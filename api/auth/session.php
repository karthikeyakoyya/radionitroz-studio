<?php
require __DIR__ . '/../config/db.php';
require __DIR__ . '/../lib/helpers.php';

if (empty($_SESSION['member_id'])) {
    respond(['authenticated' => false]);
}

respond([
    'authenticated' => true,
    'id'            => $_SESSION['member_id'],
    'role'          => $_SESSION['role'],
    'csrf_token'    => csrf_token(),
]);
