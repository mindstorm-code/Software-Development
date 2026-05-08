<?php
// POST /api/improvements/claim.php — kid taps "Claim XP" to mark an approved
// improvement as celebrated. Points were already issued on parent approval;
// this just hides the claim card from the dashboard.
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();
require_method('POST');

$user = require_auth();
if ($user['role'] !== 'child') error('Only children can claim XP', 403);

$b = body();
$improvement_id = $b['improvement_id'] ?? '';
if (!$improvement_id) error('improvement_id is required');

$res = db_select('improvements', [
    'id'       => 'eq.' . $improvement_id,
    'child_id' => 'eq.' . $user['id'],
    'status'   => 'eq.approved',
]);
if (empty($res['data'])) error('Improvement not found', 404);
$improvement = $res['data'][0];

if (!empty($improvement['claimed_at'])) {
    success(['status' => 'already_claimed', 'claimed_at' => $improvement['claimed_at']]);
}

db_update('improvements', ['id' => 'eq.' . $improvement_id], [
    'claimed_at' => date('c'),
]);

success(['status' => 'claimed', 'points' => $improvement['points_awarded'] ?? 0]);
