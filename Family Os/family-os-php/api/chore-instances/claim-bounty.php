<?php
// POST /api/chore-instances/claim-bounty.php — kid claims an open bounty.
// Sets assigned_to = self so they own it; chore submission flow takes over.
// First-come-first-served: an open bounty (assigned_to IS NULL) becomes
// theirs the moment this fires.
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();
require_method('POST');

$user = require_auth();
if ($user['role'] !== 'child') error('Only kids can claim bounties', 403);

$b = body();
$instance_id = $b['instance_id'] ?? '';
if (!$instance_id) error('instance_id is required');

// Atomic claim: only update if still up for grabs. PostgREST PATCH with
// filters doubles as a guard — if assigned_to was already set, no rows
// match and the update is a no-op.
$update = db_update(
    'chore_instances',
    [
        'id'          => 'eq.' . $instance_id,
        'family_id'   => 'eq.' . $user['family_id'],
        'assigned_to' => 'is.null',
        'status'      => 'eq.pending',
    ],
    [
        'assigned_to' => $user['id'],
    ]
);

if ($update['status'] !== 200 || empty($update['data'])) {
    error('Bounty already claimed or not found', 409);
}

success($update['data'][0], 'Bounty claimed', 200);
