<?php
// GET/PUT/DELETE /api/chores/detail.php?id=<uuid>
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();

$id = $_GET['id'] ?? '';
if (!$id) error('Chore id is required');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $user = require_auth();
    $res  = db_select('chores', ['id' => 'eq.' . $id, 'family_id' => 'eq.' . $user['family_id']]);
    if (empty($res['data'])) error('Chore not found', 404);
    success($res['data'][0]);

} elseif ($method === 'PUT' || $method === 'PATCH') {
    $parent = require_parent();
    $b      = body();

    $allowed = ['title','description','category','difficulty','points','proof_type',
                'assigned_to','recurrence','recurrence_days','recurrence_date',
                'recurrence_month','checklist','game_plan','before_photo_url',
                'after_photo_url','video_url','ai_verify','org_type','is_active'];

    $data = [];
    foreach ($allowed as $field) {
        if (array_key_exists($field, $b)) {
            $data[$field] = in_array($field, ['checklist','game_plan'])
                ? json_encode($b[$field])
                : $b[$field];
        }
    }
    $data['updated_at'] = date('c');

    $res = db_update('chores', ['id' => 'eq.' . $id, 'family_id' => 'eq.' . $parent['family_id']], $data);
    if ($res['status'] !== 200) error('Failed to update chore', 500);

    success($res['data'][0] ?? null, 'Chore updated');

} elseif ($method === 'DELETE') {
    $parent = require_parent();

    // Soft delete
    $res = db_update('chores', ['id' => 'eq.' . $id, 'family_id' => 'eq.' . $parent['family_id']], [
        'is_active'  => false,
        'updated_at' => date('c'),
    ]);
    if ($res['status'] !== 200) error('Failed to delete chore', 500);

    success(null, 'Chore deleted');
} else {
    error('Method not allowed', 405);
}
