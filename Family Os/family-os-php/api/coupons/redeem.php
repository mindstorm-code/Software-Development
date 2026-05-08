<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();
require_method('POST');

$user = require_auth();
$b    = body();

// Parent reviewing a coupon redemption
if ($user['role'] === 'parent' && !empty($b['redemption_id'])) {
    $action = $b['action'] ?? '';
    if (!in_array($action, ['approve', 'reject', 'fulfill'])) error('Invalid action');

    $res = db_select('coupon_redemptions', ['id' => 'eq.' . $b['redemption_id'], 'family_id' => 'eq.' . $user['family_id']]);
    if (empty($res['data'])) error('Redemption not found', 404);

    db_update('coupon_redemptions', ['id' => 'eq.' . $b['redemption_id']], [
        'status'      => match($action) { 'approve' => 'approved', 'reject' => 'rejected', 'fulfill' => 'fulfilled', default => 'pending' },
        'reviewed_by' => $user['id'],
        'reviewed_at' => date('c'),
    ]);
    success(['action' => $action]);
}

// Child redeeming coupon
if ($user['role'] !== 'child') error('Only children can redeem coupons', 403);

$coupon_id = $b['coupon_id'] ?? '';
if (!$coupon_id) error('coupon_id is required');

// Load coupon
$cpn_res = db_select('coupons', [
    'id'        => 'eq.' . $coupon_id,
    'is_active' => 'eq.true',
    'or'        => '(assigned_to.eq.' . $user['id'] . ',assigned_to.is.null)',
]);
if (empty($cpn_res['data'])) error('Coupon not found or not available to you', 404);
$coupon = $cpn_res['data'][0];

// Check daily limit
$today = date('Y-m-d');
$today_redemptions = db_select('coupon_redemptions', [
    'coupon_id'  => 'eq.' . $coupon_id,
    'child_id'   => 'eq.' . $user['id'],
    'redeemed_at' => 'gte.' . $today . 'T00:00:00Z',
    'select'     => 'id',
]);
if (count($today_redemptions['data'] ?? []) >= $coupon['daily_limit']) {
    error('Daily redemption limit reached for this coupon');
}

// Check balance
$ledger  = db_select('points_ledger', ['child_id' => 'eq.' . $user['id'], 'select' => 'delta']);
$balance = array_sum(array_column($ledger['data'] ?? [], 'delta'));
if ($balance < $coupon['points_cost']) {
    error('Insufficient points. You have ' . $balance . ' but need ' . $coupon['points_cost']);
}

// Deduct points
db_insert('points_ledger', [
    'family_id'  => $user['family_id'],
    'child_id'   => $user['id'],
    'delta'      => -$coupon['points_cost'],
    'reason'     => 'coupon_redeemed',
    'ref_type'   => 'coupon_redemption',
    'created_by' => $user['id'],
]);

$status = $coupon['requires_approval'] ? 'pending' : 'fulfilled';
$red = db_insert('coupon_redemptions', [
    'coupon_id'   => $coupon_id,
    'child_id'    => $user['id'],
    'family_id'   => $user['family_id'],
    'points_spent' => $coupon['points_cost'],
    'usd_value'   => $coupon['usd_value'],
    'status'      => $status,
]);

success(['redemption' => $red['data'][0] ?? null, 'status' => $status, 'new_balance' => $balance - $coupon['points_cost']], 'Coupon redeemed!', 201);
