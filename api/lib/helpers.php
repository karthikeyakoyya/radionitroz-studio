<?php
// Shared helpers: JSON responses, session guard, input access.
// Every endpoint includes this after db.php.

header('Content-Type: application/json');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function json_input(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function respond($data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function require_login(): array {
    if (empty($_SESSION['member_id'])) {
        respond(['error' => 'Not authenticated'], 401);
    }
    return [
        'id'   => $_SESSION['member_id'],
        'role' => $_SESSION['role'] ?? 'member',
    ];
}

function require_admin(): array {
    $member = require_login();
    if ($member['role'] !== 'admin') {
        respond(['error' => 'Admin access required'], 403);
    }
    return $member;
}

// --- CSRF protection ---
// A random token is issued when the session starts (see csrf_token()) and
// the front end must echo it back in the X-CSRF-Token header on every
// state-changing request. require_csrf() rejects the request otherwise.

function csrf_token(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function require_csrf(): void {
    $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $expected = $_SESSION['csrf_token'] ?? '';
    if ($expected === '' || !hash_equals($expected, $sent)) {
        respond(['error' => 'Invalid or missing CSRF token'], 403);
    }
}

// --- Login rate limiting ---
// Tracks failed attempts per email in a small file cache keyed by a hash of
// the email, so a fresh PHP process (no shared memory needed) still sees
// prior failures. Good enough for a small app; swap for Redis at scale.

function login_rate_limit_check(string $email): void {
    $key = sys_get_temp_dir() . '/rn_login_' . hash('sha256', strtolower($email)) . '.json';
    if (!file_exists($key)) {
        return;
    }
    $data = json_decode(file_get_contents($key), true) ?: [];
    $attempts = $data['attempts'] ?? 0;
    $lockedUntil = $data['locked_until'] ?? 0;
    if ($attempts >= 5 && time() < $lockedUntil) {
        $wait = $lockedUntil - time();
        respond(['error' => "Too many attempts. Try again in {$wait}s."], 429);
    }
}

function login_rate_limit_record(string $email, bool $success): void {
    $key = sys_get_temp_dir() . '/rn_login_' . hash('sha256', strtolower($email)) . '.json';
    if ($success) {
        if (file_exists($key)) {
            unlink($key);
        }
        return;
    }
    $data = file_exists($key) ? (json_decode(file_get_contents($key), true) ?: []) : [];
    $attempts = ($data['attempts'] ?? 0) + 1;
    $lockedUntil = $attempts >= 5 ? time() + 60 : ($data['locked_until'] ?? 0);
    file_put_contents($key, json_encode(['attempts' => $attempts, 'locked_until' => $lockedUntil]));
}
