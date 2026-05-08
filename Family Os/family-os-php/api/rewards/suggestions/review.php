<?php
// POST /api/rewards/suggestions/review.php — parent approves or rejects a suggestion.
// On approve: insert into rewards table and link via reward_id.
require_once __DIR__ . '/../../../includes/cors.php';
require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/db.php';
require_once __DIR__ . '/../../../includes/auth.php';

cors_headers();
require_method('POST');

$parent = require_parent();
$b      = body();

$suggestion_id = $b['suggestion_id'] ?? '';
$action        = $b['action'] ?? '';
if (!$suggestion_id || !in_array($action, ['approve', 'reject'])) {
    error('suggestion_id and action (approve|reject) are required');
}

$res = db_select('reward_suggestions', [
    'id'        => 'eq.' . $suggestion_id,
    'family_id' => 'eq.' . $parent['family_id'],
    'status'    => 'eq.pending',
]);
if (empty($res['data'])) error('Suggestion not found or already reviewed', 404);
$suggestion = $res['data'][0];

$now = date('c');

if ($action === 'reject') {
    db_update('reward_suggestions', ['id' => 'eq.' . $suggestion_id], [
        'status'      => 'rejected',
        'reviewed_by' => $parent['id'],
        'reviewed_at' => $now,
    ]);
    success(['status' => 'rejected']);
}

// Approve — create the reward, link it back.
$points_cost = isset($b['points_cost']) ? (int)$b['points_cost'] : (int)($suggestion['points_cost'] ?? 0);
if ($points_cost <= 0) error('points_cost is required to approve');

$category = $b['category'] ?? 'experience';

$reward = db_insert('rewards', [
    'family_id'         => $parent['family_id'],
    'title'             => $suggestion['title'],
    'description'       => $suggestion['description'],
    'category'          => $category,
    'points_cost'       => $points_cost,
    'is_active'         => true,
    'requires_approval' => true,
]);
if ($reward['status'] !== 201) error('Failed to create reward', 500);

$reward_id = $reward['data'][0]['id'];

db_update('reward_suggestions', ['id' => 'eq.' . $suggestion_id], [
    'status'      => 'approved',
    'reward_id'   => $reward_id,
    'points_cost' => $points_cost,
    'reviewed_by' => $parent['id'],
    'reviewed_at' => $now,
]);

success([
    'status'    => 'approved',
    'reward_id' => $reward_id,
    'reward'    => $reward['data'][0],
]);
