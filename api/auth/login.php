<?php
require __DIR__ . '/../config/db.php';
require __DIR__ . '/../lib/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'Method not allowed'], 405);
}

$input = json_input();
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if ($email === '' || $password === '') {
    respond(['error' => 'Email and password are required'], 422);
}

login_rate_limit_check($email);

$stmt = mysqli_prepare($conn, 'SELECT id, name, password_hash, role FROM members WHERE email = ? LIMIT 1');
mysqli_stmt_bind_param($stmt, 's', $email);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$member = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

if (!$member || !password_verify($password, $member['password_hash'])) {
    login_rate_limit_record($email, false);
    respond(['error' => 'Invalid email or password'], 401);
}

login_rate_limit_record($email, true);

$_SESSION['member_id'] = $member['id'];
$_SESSION['role'] = $member['role'];
// Rotate the CSRF token on login so a token from a pre-login session can't
// be reused, and hand it back so the front end can attach it to requests.
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));

respond([
    'id'         => $member['id'],
    'name'       => $member['name'],
    'role'       => $member['role'],
    'csrf_token' => $_SESSION['csrf_token'],
]);
