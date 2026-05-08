<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();
require_method('POST');

$body = body();
$email       = trim($body['email'] ?? '');
$password    = $body['password'] ?? '';
$family_name = trim($body['family_name'] ?? '');
$parent_name = trim($body['parent_name'] ?? '');

if (!$email || !$password || !$family_name || !$parent_name) {
    error('email, password, family_name, and parent_name are required');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    error('Invalid email address');
}

if (strlen($password) < 8) {
    error('Password must be at least 8 characters');
}

// 1. Create Supabase auth user
$auth = supabase_auth('signup', ['email' => $email, 'password' => $password]);
if ($auth['status'] !== 200 || empty($auth['data']['id'])) {
    $msg = $auth['data']['msg'] ?? $auth['data']['message'] ?? 'Signup failed';
    error($msg, 400);
}

$auth_id = $auth['data']['id'];

// 2. Create family
$family = db_insert('families', [
    'name'          => $family_name,
    'weekly_budget' => 50.00,
    'point_rate'    => 0.01,
    'house_score'   => 100,
]);
if ($family['status'] !== 201 || empty($family['data'][0]['id'])) {
    error('Failed to create family', 500);
}

$family_id = $family['data'][0]['id'];

// 3. Create family settings
db_insert('family_settings', ['family_id' => $family_id]);

// 4. Create parent user record
$user = db_insert('users', [
    'family_id'    => $family_id,
    'auth_id'      => $auth_id,
    'role'         => 'parent',
    'display_name' => $parent_name,
    'email'        => $email,
]);
if ($user['status'] !== 201 || empty($user['data'][0]['id'])) {
    error('Failed to create user profile', 500);
}

success([
    'user'        => $user['data'][0],
    'family'      => $family['data'][0],
    'access_token' => $auth['data']['access_token'] ?? null,
    'refresh_token' => $auth['data']['refresh_token'] ?? null,
], 'Account created successfully', 201);
