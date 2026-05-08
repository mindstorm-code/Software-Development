<?php
// GET  — list submissions (parent sees family, child sees own)
// POST — child submits a chore
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $user   = require_auth();
    $query  = [
        'family_id' => 'eq.' . $user['family_id'],
        'select'    => '*,child:users(id,display_name,avatar_url),chore:chores(id,title,points,after_photo_url)',
        'order'     => 'submitted_at.desc',
    ];

    if ($user['role'] === 'child') {
        $query['child_id'] = 'eq.' . $user['id'];
    }

    if (!empty($_GET['status'])) {
        $query['status'] = 'eq.' . $_GET['status'];
    }

    $res = db_select('submissions', $query);
    if ($res['status'] !== 200) error('Failed to load submissions', 500);
    success($res['data']);

} elseif ($method === 'POST') {
    $user = require_auth();
    if ($user['role'] !== 'child') error('Only children can submit chores', 403);

    $b = body();
    if (empty($b['instance_id']) || empty($b['chore_id'])) {
        error('instance_id and chore_id are required');
    }

    // Verify instance belongs to this child
    $inst_res = db_select('chore_instances', [
        'id'          => 'eq.' . $b['instance_id'],
        'assigned_to' => 'eq.' . $user['id'],
    ]);
    if (empty($inst_res['data'])) error('Instance not found', 404);
    $instance = $inst_res['data'][0];

    if ($instance['status'] === 'submitted' || $instance['status'] === 'approved') {
        error('Chore already submitted');
    }

    // Load chore to check proof_type requirements
    $chore_res = db_select('chores', ['id' => 'eq.' . $b['chore_id']]);
    if (empty($chore_res['data'])) error('Chore not found', 404);
    $chore = $chore_res['data'][0];

    $photo_urls    = $b['photo_urls'] ?? [];
    $checklist_done = $b['checklist_done'] ?? [];

    // Validate proof requirements
    if (in_array($chore['proof_type'], ['photo', 'photo_checklist']) && empty($photo_urls)) {
        error('At least one photo is required for this chore');
    }
    if (in_array($chore['proof_type'], ['checklist', 'photo_checklist']) && empty($checklist_done)) {
        error('Checklist completion is required for this chore');
    }

    // Create submission
    $sub = db_insert('submissions', [
        'instance_id'      => $b['instance_id'],
        'chore_id'         => $b['chore_id'],
        'child_id'         => $user['id'],
        'family_id'        => $user['family_id'],
        'photo_urls'       => $photo_urls,
        'checklist_done'   => json_encode($checklist_done),
        'duration_seconds' => $b['duration_seconds'] ?? null,
        'notes'            => $b['notes'] ?? null,
        'status'           => 'pending',
        'points_awarded'   => $chore['points'],
    ]);
    if ($sub['status'] !== 201) error('Failed to submit chore', 500);

    // Update instance status
    db_update('chore_instances', ['id' => 'eq.' . $b['instance_id']], ['status' => 'submitted']);

    success($sub['data'][0], 'Chore submitted successfully', 201);
} else {
    error('Method not allowed', 405);
}
