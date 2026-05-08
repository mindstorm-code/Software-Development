<?php
// GET /api/points/leaderboard.php — family leaderboard
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();
require_method('GET');

$user      = require_auth();
$family_id = $user['family_id'];
$period    = $_GET['period'] ?? 'all'; // 'week', 'month', 'all'

// Load all children in the family
$children_res = db_select('users', [
    'family_id' => 'eq.' . $family_id,
    'role'      => 'eq.child',
    'is_active' => 'eq.true',
]);
$children = $children_res['data'] ?? [];

$board = [];
foreach ($children as $child) {
    $query = [
        'child_id' => 'eq.' . $child['id'],
        'select'   => 'delta,created_at',
    ];

    if ($period === 'week') {
        $query['created_at'] = 'gte.' . date('Y-m-d', strtotime('monday this week')) . 'T00:00:00Z';
    } elseif ($period === 'month') {
        $query['created_at'] = 'gte.' . date('Y-m-01') . 'T00:00:00Z';
    }

    $ledger = db_select('points_ledger', $query);
    $entries = $ledger['data'] ?? [];
    $balance = array_sum(array_column($entries, 'delta'));
    $earned  = array_sum(array_filter(array_column($entries, 'delta'), fn($d) => $d > 0));

    // Chore count for this period
    $sub_query = ['child_id' => 'eq.' . $child['id'], 'status' => 'eq.approved', 'select' => 'id'];
    if ($period !== 'all') {
        $sub_query['submitted_at'] = $query['created_at'] ?? null;
        if (!$sub_query['submitted_at']) unset($sub_query['submitted_at']);
    }
    $subs = db_select('submissions', $sub_query);
    $chore_count = count($subs['data'] ?? []);

    $board[] = [
        'child_id'    => $child['id'],
        'name'        => $child['display_name'],
        'avatar_url'  => $child['avatar_url'],
        'streak'      => $child['streak'],
        'level'       => $child['level'],
        'rating'      => $child['rating'],
        'balance'     => $balance,
        'earned'      => $earned,
        'chore_count' => $chore_count,
    ];
}

// Sort by earned descending
usort($board, fn($a, $b) => $b['earned'] <=> $a['earned']);

// Add rank
foreach ($board as $i => &$entry) {
    $entry['rank'] = $i + 1;
}

success(['period' => $period, 'leaderboard' => $board]);
