<?php
// POST /api/chore-instances/release-overdue.php — auto-release any past-due
// pending chores into the family's open bounty pool. Idempotent + safe to
// call from a cron OR lazily on dashboard load.
//
// A chore_instance is released when:
//   * Its parent chore has release_unclaimed = TRUE
//   * status = 'pending'
//   * due_date < CURRENT_DATE (i.e. yesterday or earlier)
//   * released_at IS NULL (not already released)
//
// We stash the original assignee for "your sibling missed it!" UX, then
// null out assigned_to so any kid in the family can claim.
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();
require_method('POST');

$user = require_auth();
$family_id = $user['family_id'];
$now       = date('c');
$today     = date('Y-m-d');

// Find candidate instances. We need to join to chores to check the toggle —
// PostgREST embedding handles this in one query.
$res = db_select('chore_instances', [
    'family_id'   => 'eq.' . $family_id,
    'status'      => 'eq.pending',
    'due_date'    => 'lt.' . $today,
    'released_at' => 'is.null',
    'select'      => 'id,assigned_to,chore_id,chore:chores(id,release_unclaimed)',
]);
if ($res['status'] !== 200) error('Failed to load candidates', 500);

$released = [];
foreach ($res['data'] ?? [] as $inst) {
    $chore = $inst['chore'] ?? null;
    if (!$chore || empty($chore['release_unclaimed'])) continue;

    db_update('chore_instances', ['id' => 'eq.' . $inst['id']], [
        'released_at'       => $now,
        'original_assignee' => $inst['assigned_to'],
        'assigned_to'       => null,
    ]);
    $released[] = $inst['id'];
}

success([
    'released_count' => count($released),
    'released_ids'   => $released,
]);
