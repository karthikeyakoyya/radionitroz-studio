<?php
require __DIR__ . '/../config/db.php';
require __DIR__ . '/../lib/helpers.php';

$_SESSION = [];
session_destroy();

respond(['message' => 'Logged out']);
