<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $user      = require_auth();
    $family_id = $user['family_id'];

    $query = ['family_id' => 'eq.' . $family_id, 'is_active' => 'eq.true', 'order' => 'created_at.desc'];

    // Child sees only chores assigned to them or to all (null)
    if ($user['role'] === 'child') {
        // PostgREST OR filter: assigned_to eq child id OR assigned_to is null
        $query['or'] = '(assigned_to.eq.' . $user['id'] . ',assigned_to.is.null)';
        unset($query['is_active']); // re-add
        $query['is_active'] = 'eq.true';
    }

    $res = db_select('chores', $query);
    if ($res['status'] !== 200) error('Failed to load chores', 500);

    success($res['data']);

} elseif ($method === 'POST') {
    $parent = require_parent();
    $b      = body();

    $required = ['title', 'points'];
    foreach ($required as $field) {
        if (empty($b[$field])) error("$field is required");
    }

    $row = [
        'family_id'       => $parent['family_id'],
        'title'           => trim($b['title']),
        'description'     => $b['description'] ?? null,
        'category'        => $b['category'] ?? 'general',
        'difficulty'      => $b['difficulty'] ?? 'medium',
        'points'          => (int)$b['points'],
        'proof_type'      => $b['proof_type'] ?? 'photo',
        'assigned_to'     => $b['assigned_to'] ?? null,
        'recurrence'      => $b['recurrence'] ?? 'daily',
        'recurrence_days' => $b['recurrence_days'] ?? null,
        'recurrence_date' => $b['recurrence_date'] ?? null,
        'recurrence_month'=> $b['recurrence_month'] ?? null,
        'checklist'       => json_encode($b['checklist'] ?? []),
        'game_plan'       => json_encode($b['game_plan'] ?? []),
        'before_photo_url'=> $b['before_photo_url'] ?? null,
        'after_photo_url' => $b['after_photo_url'] ?? null,
        'video_url'       => $b['video_url'] ?? null,
        'ai_verify'       => (bool)($b['ai_verify'] ?? false),
        'org_type'        => $b['org_type'] ?? null,
        'is_active'       => true,
    ];

    $res = db_insert('chores', $row);
    if ($res['status'] !== 201) error('Failed to create chore', 500);

    success($res['data'][0], 'Chore created', 201);
} else {
    error('Method not allowed', 405);
}
