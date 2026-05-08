<?php
// GET  — list improvements (parent: family-wide; child: own)
// POST — child submits a 1-minute improvement (capped at 3 per day)
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();

const DAILY_CAP = 3;

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $user  = require_auth();
    $query = [
        'family_id' => 'eq.' . $user['family_id'],
        'select'    => '*,child:users(id,display_name,avatar_url)',
        'order'     => 'submitted_at.desc',
    ];

    if ($user['role'] === 'child') {
        $query['child_id'] = 'eq.' . $user['id'];
    }

    if (!empty($_GET['status'])) {
        $query['status'] = 'eq.' . $_GET['status'];
    }

    $res = db_select('improvements', $query);
    if ($res['status'] !== 200) error('Failed to load improvements', 500);
    success($res['data'] ?? []);

} elseif ($method === 'POST') {
    $user = require_auth();
    if ($user['role'] !== 'child') error('Only children can submit improvements', 403);

    $b = body();
    if (empty($b['photo_url']) || empty($b['description'])) {
        error('photo_url and description are required');
    }

    // Enforce daily cap (3 per kid per local-ish day; UTC boundary is fine for now).
    $today_start = date('Y-m-d') . 'T00:00:00Z';
    $count_res = db_select('improvements', [
        'child_id'     => 'eq.' . $user['id'],
        'submitted_at' => 'gte.' . $today_start,
        'select'       => 'id',
    ]);
    $count_today = is_array($count_res['data'] ?? null) ? count($count_res['data']) : 0;
    if ($count_today >= DAILY_CAP) {
        error("Daily limit reached ({$count_today}/" . DAILY_CAP . ")", 409);
    }

    $res = db_insert('improvements', [
        'family_id'   => $user['family_id'],
        'child_id'    => $user['id'],
        'photo_url'   => $b['photo_url'],
        'description' => trim($b['description']),
        'status'      => 'pending',
    ]);
    if ($res['status'] !== 201) error('Failed to submit improvement', 500);
    success($res['data'][0], 'Improvement submitted', 201);

} else {
    error('Method not allowed', 405);
}
