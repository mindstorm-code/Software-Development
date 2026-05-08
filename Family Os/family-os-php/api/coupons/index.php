<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $user  = require_auth();
    $query = ['family_id' => 'eq.' . $user['family_id'], 'is_active' => 'eq.true', 'order' => 'usd_value.desc'];

    if ($user['role'] === 'child') {
        $query['or'] = '(assigned_to.eq.' . $user['id'] . ',assigned_to.is.null)';
    }

    $res = db_select('coupons', $query);
    success($res['data'] ?? []);

} elseif ($method === 'POST') {
    $parent = require_parent();
    $b      = body();

    if (empty($b['title']) || !isset($b['usd_value'])) {
        error('title and usd_value are required');
    }

    // Load family point_rate to calculate points_cost
    $fam  = db_select('families', ['id' => 'eq.' . $parent['family_id']]);
    $rate = (float)($fam['data'][0]['point_rate'] ?? 0.01);
    $usd  = (float)$b['usd_value'];
    $points_cost = isset($b['points_cost']) ? (int)$b['points_cost'] : (int)round($usd / $rate);

    $res = db_insert('coupons', [
        'family_id'        => $parent['family_id'],
        'title'            => trim($b['title']),
        'description'      => $b['description'] ?? null,
        'usd_value'        => $usd,
        'points_cost'      => $points_cost,
        'image_url'        => $b['image_url'] ?? null,
        'assigned_to'      => $b['assigned_to'] ?? null,
        'is_repeatable'    => (bool)($b['is_repeatable'] ?? false),
        'daily_limit'      => (int)($b['daily_limit'] ?? 1),
        'requires_approval' => (bool)($b['requires_approval'] ?? true),
        'is_active'        => true,
    ]);
    if ($res['status'] !== 201) error('Failed to create coupon', 500);
    success($res['data'][0], 'Coupon created', 201);

} else {
    error('Method not allowed', 405);
}
