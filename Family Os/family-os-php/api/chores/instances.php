<?php
// GET  /api/chores/instances.php?date=YYYY-MM-DD  — list instances for a date
// POST /api/chores/instances.php                   — generate today's instances (parent only)
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $user      = require_auth();
    $date      = $_GET['date'] ?? date('Y-m-d');
    $family_id = $user['family_id'];

    $query = [
        'family_id' => 'eq.' . $family_id,
        'due_date'  => 'eq.' . $date,
        'order'     => 'created_at.asc',
        'select'    => '*,chore:chores(*)',
    ];

    if ($user['role'] === 'child') {
        $query['assigned_to'] = 'eq.' . $user['id'];
    }

    $res = db_select('chore_instances', $query);
    if ($res['status'] !== 200) error('Failed to load instances', 500);

    success($res['data']);

} elseif ($method === 'POST') {
    $parent    = require_parent();
    $family_id = $parent['family_id'];
    $date      = body()['date'] ?? date('Y-m-d');
    $day_ts    = strtotime($date);
    $dow       = (int)date('w', $day_ts); // 0=Sun
    $dom       = (int)date('j', $day_ts); // 1-31
    $month     = (int)date('n', $day_ts); // 1-12

    // Load all active chore templates
    $chores_res = db_select('chores', ['family_id' => 'eq.' . $family_id, 'is_active' => 'eq.true']);
    $chores     = $chores_res['data'] ?? [];

    // Load children
    $children_res = db_select('users', ['family_id' => 'eq.' . $family_id, 'role' => 'eq.child', 'is_active' => 'eq.true']);
    $children     = $children_res['data'] ?? [];

    $created = 0;
    foreach ($chores as $chore) {
        if (!chore_due_on($chore, $dow, $dom, $month)) continue;

        $targets = $chore['assigned_to']
            ? [$chore['assigned_to']]
            : array_column($children, 'id');

        foreach ($targets as $child_id) {
            $existing = db_select('chore_instances', [
                'chore_id'    => 'eq.' . $chore['id'],
                'assigned_to' => 'eq.' . $child_id,
                'due_date'    => 'eq.' . $date,
            ]);
            if (!empty($existing['data'])) continue; // already exists

            db_insert('chore_instances', [
                'chore_id'    => $chore['id'],
                'family_id'   => $family_id,
                'assigned_to' => $child_id,
                'due_date'    => $date,
                'status'      => 'pending',
            ]);
            $created++;
        }
    }

    success(['created' => $created, 'date' => $date], "$created instances generated");
} else {
    error('Method not allowed', 405);
}

function chore_due_on(array $chore, int $dow, int $dom, int $month): bool {
    return match ($chore['recurrence']) {
        'daily'   => true,
        'weekly'  => in_array($dow, $chore['recurrence_days'] ?? []),
        'monthly' => ($chore['recurrence_date'] ?? null) === $dom,
        'yearly'  => ($chore['recurrence_month'] ?? null) === $month && ($chore['recurrence_date'] ?? null) === $dom,
        'once'    => true,
        default   => false,
    };
}
