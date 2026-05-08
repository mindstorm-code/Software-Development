<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();
require_method('POST');

$body     = body();
$email    = trim($body['email'] ?? '');
$password = $body['password'] ?? '';

if (!$email || !$password) {
    error('email and password are required');
}

// Authenticate with Supabase
$auth = supabase_auth('token?grant_type=password', [
    'email'    => $email,
    'password' => $password,
]);

if ($auth['status'] !== 200 || empty($auth['data']['access_token'])) {
    $msg = $auth['data']['error_description'] ?? $auth['data']['msg'] ?? 'Invalid credentials';
    error($msg, 401);
}

$auth_id = $auth['data']['user']['id'] ?? null;
if (!$auth_id) error('Login failed', 500);

// Load user profile
$res = db_select('users', ['auth_id' => 'eq.' . $auth_id, 'is_active' => 'eq.true']);
if ($res['status'] !== 200 || empty($res['data'])) {
    error('User profile not found', 404);
}

$user = $res['data'][0];

// Load family
$fam = db_select('families', ['id' => 'eq.' . $user['family_id']]);
$family = $fam['data'][0] ?? null;

success([
    'user'          => $user,
    'family'        => $family,
    'access_token'  => $auth['data']['access_token'],
    'refresh_token' => $auth['data']['refresh_token'],
    'expires_in'    => $auth['data']['expires_in'],
]);
