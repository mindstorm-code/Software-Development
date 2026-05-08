<?php
// POST /api/improvements/review.php — parent approves or rejects an improvement.
// Parent picks a category which drives default points + whether a chore is created:
//   * chore_improvement  — better way to do an existing chore (default 15 XP, makes chore)
//   * space_improvement  — improvement to a space/area      (default 10 XP, makes chore)
//   * nice_thing         — kudos (default  5 XP, no chore)
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();
require_method('POST');

const CATEGORY_DEFAULTS = [
    'chore_improvement' => ['points' => 15, 'make_chore' => true,  'recurrence' => 'weekly'],
    'space_improvement' => ['points' => 10, 'make_chore' => true,  'recurrence' => 'weekly'],
    'nice_thing'        => ['points' => 5,  'make_chore' => false, 'recurrence' => 'once'],
];

$parent = require_parent();
$b      = body();

$improvement_id = $b['improvement_id'] ?? '';
$action         = $b['action'] ?? '';
if (!$improvement_id || !in_array($action, ['approve', 'reject'])) {
    error('improvement_id and action (approve|reject) are required');
}

$res = db_select('improvements', [
    'id'        => 'eq.' . $improvement_id,
    'family_id' => 'eq.' . $parent['family_id'],
    'status'    => 'eq.pending',
]);
if (empty($res['data'])) error('Improvement not found or already reviewed', 404);
$improvement = $res['data'][0];

$now = date('c');

if ($action === 'reject') {
    db_update('improvements', ['id' => 'eq.' . $improvement_id], [
        'status'      => 'rejected',
        'reviewed_by' => $parent['id'],
        'reviewed_at' => $now,
    ]);
    success(['status' => 'rejected']);
}

// Approve — category is required so we can apply sane defaults.
$category = $b['category'] ?? '';
if (!isset(CATEGORY_DEFAULTS[$category])) {
    error('Valid category required: chore_improvement, space_improvement, or nice_thing');
}
$defaults = CATEGORY_DEFAULTS[$category];

$points_awarded = isset($b['points_awarded']) ? (int)$b['points_awarded'] : $defaults['points'];
if ($points_awarded < 0) $points_awarded = 0;

// make_chore: explicit override else category default
$make_chore = $b['make_chore'] ?? $defaults['make_chore'];

$converted_chore_id = null;
if ($make_chore) {
    $convert = is_array($b['convert_to_chore'] ?? null) ? $b['convert_to_chore'] : [];
    $chore_payload = [
        'family_id'   => $parent['family_id'],
        'title'       => trim($convert['title'] ?? substr($improvement['description'], 0, 80)),
        'description' => $convert['description'] ?? $improvement['description'],
        'category'    => $convert['category'] ?? ($category === 'space_improvement' ? 'cleaning' : 'general'),
        'difficulty'  => $convert['difficulty'] ?? 'easy',
        'points'      => isset($convert['points']) ? (int)$convert['points'] : $points_awarded,
        'proof_type'  => $convert['proof_type'] ?? 'photo',
        'assigned_to' => $convert['assigned_to'] ?? $improvement['child_id'],
        'recurrence'  => $convert['recurrence'] ?? $defaults['recurrence'],
        'is_active'   => true,
    ];
    $chore_res = db_insert('chores', $chore_payload);
    if ($chore_res['status'] === 201) {
        $converted_chore_id = $chore_res['data'][0]['id'];
    }
}

db_update('improvements', ['id' => 'eq.' . $improvement_id], [
    'status'             => 'approved',
    'category'           => $category,
    'points_awarded'     => $points_awarded,
    'converted_chore_id' => $converted_chore_id,
    'reviewed_by'        => $parent['id'],
    'reviewed_at'        => $now,
]);

if ($points_awarded > 0) {
    db_insert('points_ledger', [
        'family_id'  => $parent['family_id'],
        'child_id'   => $improvement['child_id'],
        'delta'      => $points_awarded,
        'reason'     => 'improvement_approved',
        'ref_id'     => $improvement_id,
        'ref_type'   => 'improvement',
        'note'       => $b['note'] ?? $category,
        'created_by' => $parent['id'],
    ]);
}

success([
    'status'             => 'approved',
    'category'           => $category,
    'points_awarded'     => $points_awarded,
    'converted_chore_id' => $converted_chore_id,
]);
