<?php
// POST /api/rewards/redeem.php  — child redeems a reward
// POST /api/rewards/redeem.php with action  — parent approves/rejects
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();
require_method('POST');

$user = require_auth();
$b    = body();

// Parent reviewing a redemption
if ($user['role'] === 'parent' && !empty($b['redemption_id'])) {
    $action = $b['action'] ?? '';
    if (!in_array($action, ['approve', 'reject', 'fulfill'])) error('Invalid action');

    $res = db_select('reward_redemptions', [
        'id'        => 'eq.' . $b['redemption_id'],
        'family_id' => 'eq.' . $user['family_id'],
    ]);
    if (empty($res['data'])) error('Redemption not found', 404);
    $redemption = $res['data'][0];

    $new_status = match($action) {
        'approve'  => 'approved',
        'reject'   => 'rejected',
        'fulfill'  => 'fulfilled',
        default    => 'pending',
    };

    db_update('reward_redemptions', ['id' => 'eq.' . $b['redemption_id']], [
        'status'      => $new_status,
        'reviewed_by' => $user['id'],
        'reviewed_at' => date('c'),
    ]);

    // Deduct points on approve (not fulfill — points deducted at redemption request)
    success(['status' => $new_status]);
}

// Child requesting redemption
if ($user['role'] !== 'child') error('Only children can redeem rewards', 403);

$reward_id = $b['reward_id'] ?? '';
if (!$reward_id) error('reward_id is required');

// Load reward
$rwd_res = db_select('rewards', [
    'id'        => 'eq.' . $reward_id,
    'family_id' => 'eq.' . $user['family_id'],
    'is_active' => 'eq.true',
]);
if (empty($rwd_res['data'])) error('Reward not found', 404);
$reward = $rwd_res['data'][0];

// Check balance
$ledger = db_select('points_ledger', ['child_id' => 'eq.' . $user['id'], 'select' => 'delta']);
$balance = array_sum(array_column($ledger['data'] ?? [], 'delta'));

if ($balance < $reward['points_cost']) {
    error('Insufficient points. You have ' . $balance . ' but need ' . $reward['points_cost']);
}

// Deduct points
db_insert('points_ledger', [
    'family_id'  => $user['family_id'],
    'child_id'   => $user['id'],
    'delta'      => -$reward['points_cost'],
    'reason'     => 'reward_redeemed',
    'ref_type'   => 'reward_redemption',
    'created_by' => $user['id'],
]);

// Create redemption record
$status = $reward['requires_approval'] ? 'pending' : 'fulfilled';
$red = db_insert('reward_redemptions', [
    'reward_id'   => $reward_id,
    'child_id'    => $user['id'],
    'family_id'   => $user['family_id'],
    'points_spent' => $reward['points_cost'],
    'status'      => $status,
]);
if ($red['status'] !== 201) error('Failed to create redemption', 500);

// Update ref_id in ledger
$ledger_entry = db_select('points_ledger', [
    'child_id' => 'eq.' . $user['id'],
    'reason'   => 'eq.reward_redeemed',
    'ref_id'   => 'is.null',
    'order'    => 'created_at.desc',
    'limit'    => 1,
]);
if (!empty($ledger_entry['data'])) {
    db_update('points_ledger', ['id' => 'eq.' . $ledger_entry['data'][0]['id']], [
        'ref_id' => $red['data'][0]['id'],
    ]);
}

success(['redemption' => $red['data'][0], 'status' => $status, 'new_balance' => $balance - $reward['points_cost']], 'Reward redeemed!', 201);
