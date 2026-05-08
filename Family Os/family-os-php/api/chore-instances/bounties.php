<?php
// GET /api/chore-instances/bounties.php — list open bounties for the auth'd
// user's family. Anyone in the family can see them; any kid can claim.
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();
require_method('GET');

$user = require_auth();

$res = db_select('chore_instances', [
    'family_id'   => 'eq.' . $user['family_id'],
    'status'      => 'eq.pending',
    'assigned_to' => 'is.null',
    'released_at' => 'not.is.null',
    'order'       => 'released_at.desc',
    'select'      => '*,chore:chores(id,title,description,points,difficulty,category,proof_type,checklist),original:users!chore_instances_original_assignee_fkey(id,display_name)',
]);
if ($res['status'] !== 200) error('Failed to load bounties', 500);

success($res['data'] ?? []);
