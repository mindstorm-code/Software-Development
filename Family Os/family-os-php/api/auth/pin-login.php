<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();
require_method('POST');

$body      = body();
$family_id = trim($body['family_id'] ?? '');
$child_id  = trim($body['child_id'] ?? '');
$pin       = trim($body['pin'] ?? '');

if (!$family_id || !$child_id || !$pin) {
    error('family_id, child_id, and pin are required');
}

if (!preg_match('/^\d{4}$/', $pin)) {
    error('PIN must be 4 digits');
}

// Load child record
$res = db_select('users', [
    'id'        => 'eq.' . $child_id,
    'family_id' => 'eq.' . $family_id,
    'role'      => 'eq.child',
    'is_active' => 'eq.true',
]);

if ($res['status'] !== 200 || empty($res['data'])) {
    error('Child not found', 404);
}

$child = $res['data'][0];

if (!$child['pin_hash'] || !verify_pin($pin, $child['pin_hash'])) {
    error('Incorrect PIN', 401);
}

// Update last_active
db_update('users', ['id' => 'eq.' . $child_id], ['last_active' => date('Y-m-d')]);

// Load family
$fam    = db_select('families', ['id' => 'eq.' . $family_id]);
$family = $fam['data'][0] ?? null;

// Generate PIN session token
$token = generate_pin_token($child['id'], $family_id);

success([
    'user'   => $child,
    'family' => $family,
    'token'  => $token,
]);
