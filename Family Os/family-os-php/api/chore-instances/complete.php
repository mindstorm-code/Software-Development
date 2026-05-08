<?php
// POST /api/chore-instances/complete.php — parent self-completes their own chore instance.
// Skips photo proof + parent review (parents don't earn points and don't need to submit evidence).
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();
require_method('POST');

$parent = require_parent();
$b      = body();

$instance_id = $b['instance_id'] ?? '';
if (!$instance_id) error('instance_id is required');

$res = db_select('chore_instances', [
    'id'          => 'eq.' . $instance_id,
    'family_id'   => 'eq.' . $parent['family_id'],
    'assigned_to' => 'eq.' . $parent['id'],
]);
if (empty($res['data'])) error('Instance not found or not assigned to you', 404);
$instance = $res['data'][0];

if ($instance['status'] === 'approved') {
    error('Already completed');
}

db_update('chore_instances', ['id' => 'eq.' . $instance_id], [
    'status' => 'approved',
]);

success(['status' => 'approved']);
