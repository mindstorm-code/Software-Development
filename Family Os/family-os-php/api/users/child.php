<?php
// GET/PUT/DELETE /api/users/child.php?id=<uuid>
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();

$id = $_GET['id'] ?? '';
if (!$id) error('Child id is required');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $user = require_auth();
    $res  = db_select('users', ['id' => 'eq.' . $id, 'family_id' => 'eq.' . $user['family_id']]);
    if (empty($res['data'])) error('Child not found', 404);

    $child = $res['data'][0];

    // Balance
    $ledger = db_select('points_ledger', ['child_id' => 'eq.' . $id, 'select' => 'delta,created_at,reason']);
    $balance = array_sum(array_column($ledger['data'] ?? [], 'delta'));
    $child['balance'] = $balance;

    // Achievements
    $ach = db_select('user_achievements', ['user_id' => 'eq.' . $id, 'select' => '*,achievement:achievements(*)']);
    $child['achievements'] = $ach['data'] ?? [];

    // Stats
    $subs = db_select('submissions', ['child_id' => 'eq.' . $id, 'status' => 'eq.approved', 'select' => 'id']);
    $child['total_chores_completed'] = count($subs['data'] ?? []);

    success($child);

} elseif ($method === 'PUT' || $method === 'PATCH') {
    $parent = require_parent();
    $b      = body();

    $data = [];
    if (isset($b['display_name'])) $data['display_name'] = trim($b['display_name']);
    if (isset($b['avatar_url']))   $data['avatar_url']   = $b['avatar_url'];
    if (isset($b['pin'])) {
        if (!preg_match('/^\d{4}$/', $b['pin'])) error('PIN must be 4 digits');
        $data['pin_hash'] = hash_pin($b['pin']);
    }
    if (isset($b['rating'])) $data['rating'] = (float)$b['rating'];
    $data['updated_at'] = date('c');

    $res = db_update('users', ['id' => 'eq.' . $id, 'family_id' => 'eq.' . $parent['family_id'], 'role' => 'eq.child'], $data);
    if ($res['status'] !== 200) error('Failed to update child', 500);
    success($res['data'][0] ?? null, 'Child updated');

} elseif ($method === 'DELETE') {
    $parent = require_parent();
    // Soft delete
    $res = db_update('users', ['id' => 'eq.' . $id, 'family_id' => 'eq.' . $parent['family_id'], 'role' => 'eq.child'], [
        'is_active'  => false,
        'updated_at' => date('c'),
    ]);
    if ($res['status'] !== 200) error('Failed to remove child', 500);
    success(null, 'Child removed');

} else {
    error('Method not allowed', 405);
}
