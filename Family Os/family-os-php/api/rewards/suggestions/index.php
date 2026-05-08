<?php
// GET  — list reward suggestions (parent: family-wide; child: own)
// POST — child proposes a new reward
require_once __DIR__ . '/../../../includes/cors.php';
require_once __DIR__ . '/../../../includes/response.php';
require_once __DIR__ . '/../../../includes/db.php';
require_once __DIR__ . '/../../../includes/auth.php';

cors_headers();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $user  = require_auth();
    $query = [
        'family_id' => 'eq.' . $user['family_id'],
        'select'    => '*,child:users(id,display_name,avatar_url)',
        'order'     => 'created_at.desc',
    ];

    if ($user['role'] === 'child') {
        $query['child_id'] = 'eq.' . $user['id'];
    }

    if (!empty($_GET['status'])) {
        $query['status'] = 'eq.' . $_GET['status'];
    }

    $res = db_select('reward_suggestions', $query);
    if ($res['status'] !== 200) error('Failed to load suggestions', 500);
    success($res['data'] ?? []);

} elseif ($method === 'POST') {
    $user = require_auth();
    if ($user['role'] !== 'child') error('Only children can suggest rewards', 403);

    $b = body();
    if (empty($b['title'])) error('title is required');

    $res = db_insert('reward_suggestions', [
        'family_id'   => $user['family_id'],
        'child_id'    => $user['id'],
        'title'       => trim($b['title']),
        'description' => $b['description'] ?? null,
        'points_cost' => isset($b['points_cost']) ? (int)$b['points_cost'] : null,
        'status'      => 'pending',
    ]);
    if ($res['status'] !== 201) error('Failed to create suggestion', 500);
    success($res['data'][0], 'Suggestion submitted', 201);

} else {
    error('Method not allowed', 405);
}
