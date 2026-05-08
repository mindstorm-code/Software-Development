<?php
// GET  — list children in family
// POST — add a new child
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $parent = require_parent();
    $res    = db_select('users', [
        'family_id' => 'eq.' . $parent['family_id'],
        'role'      => 'eq.child',
        'is_active' => 'eq.true',
        'order'     => 'display_name.asc',
    ]);
    // Enrich with point balances
    $children = $res['data'] ?? [];
    foreach ($children as &$child) {
        $ledger  = db_select('points_ledger', ['child_id' => 'eq.' . $child['id'], 'select' => 'delta']);
        $child['balance'] = array_sum(array_column($ledger['data'] ?? [], 'delta'));

        // Today's progress
        $today_instances = db_select('chore_instances', [
            'assigned_to' => 'eq.' . $child['id'],
            'due_date'    => 'eq.' . date('Y-m-d'),
            'select'      => 'status',
        ]);
        $all_today   = count($today_instances['data'] ?? []);
        $done_today  = count(array_filter($today_instances['data'] ?? [], fn($i) => in_array($i['status'], ['approved', 'submitted'])));
        $child['today_total']    = $all_today;
        $child['today_complete'] = $done_today;
        $child['today_pct']      = $all_today > 0 ? round($done_today / $all_today * 100) : 0;

        // Achievement count
        $ach = db_select('user_achievements', ['user_id' => 'eq.' . $child['id'], 'select' => 'id']);
        $child['achievement_count'] = count($ach['data'] ?? []);
    }

    success($children);

} elseif ($method === 'POST') {
    $parent = require_parent();
    $b      = body();

    if (empty($b['display_name']) || empty($b['pin'])) {
        error('display_name and pin are required');
    }
    if (!preg_match('/^\d{4}$/', $b['pin'])) {
        error('PIN must be exactly 4 digits');
    }

    $res = db_insert('users', [
        'family_id'    => $parent['family_id'],
        'role'         => 'child',
        'display_name' => trim($b['display_name']),
        'avatar_url'   => $b['avatar_url'] ?? null,
        'pin_hash'     => hash_pin($b['pin']),
        'level'        => 1,
        'streak'       => 0,
        'rating'       => 5.0,
        'is_active'    => true,
    ]);
    if ($res['status'] !== 201) error('Failed to create child', 500);
    success($res['data'][0], 'Child added', 201);

} else {
    error('Method not allowed', 405);
}
