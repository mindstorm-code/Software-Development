<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $user  = require_auth();
    $res   = db_select('rewards', [
        'family_id' => 'eq.' . $user['family_id'],
        'is_active' => 'eq.true',
        'order'     => 'points_cost.asc',
    ]);
    success($res['data'] ?? []);

} elseif ($method === 'POST') {
    $parent = require_parent();
    $b      = body();

    if (empty($b['title']) || empty($b['points_cost'])) {
        error('title and points_cost are required');
    }

    $res = db_insert('rewards', [
        'family_id'        => $parent['family_id'],
        'title'            => trim($b['title']),
        'description'      => $b['description'] ?? null,
        'category'         => $b['category'] ?? 'experience',
        'points_cost'      => (int)$b['points_cost'],
        'image_url'        => $b['image_url'] ?? null,
        'is_active'        => true,
        'requires_approval' => (bool)($b['requires_approval'] ?? true),
    ]);
    if ($res['status'] !== 201) error('Failed to create reward', 500);
    success($res['data'][0], 'Reward created', 201);

} else {
    error('Method not allowed', 405);
}
