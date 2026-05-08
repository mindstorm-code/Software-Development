<?php
// POST /api/submissions/review.php — parent approves or rejects a submission
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();
require_method('POST');

$parent = require_parent();
$b      = body();

$submission_id = $b['submission_id'] ?? '';
$action        = $b['action'] ?? ''; // 'approve' or 'reject'
$points_override = isset($b['points']) ? (int)$b['points'] : null;
$note          = $b['note'] ?? null;

if (!$submission_id || !in_array($action, ['approve', 'reject'])) {
    error('submission_id and action (approve|reject) are required');
}

// Load submission
$res = db_select('submissions', [
    'id'        => 'eq.' . $submission_id,
    'family_id' => 'eq.' . $parent['family_id'],
    'status'    => 'eq.pending',
]);
if (empty($res['data'])) error('Submission not found or already reviewed', 404);

$submission = $res['data'][0];
$now        = date('c');
$status     = $action === 'approve' ? 'approved' : 'rejected';
$points     = $points_override ?? $submission['points_awarded'];

// Update submission
db_update('submissions', ['id' => 'eq.' . $submission_id], [
    'status'         => $status,
    'points_awarded' => $points,
    'reviewed_by'    => $parent['id'],
    'reviewed_at'    => $now,
]);

// Update chore instance
db_update('chore_instances', ['id' => 'eq.' . $submission['instance_id']], [
    'status' => $status,
]);

if ($action === 'approve' && $points > 0) {
    // Add to points ledger
    db_insert('points_ledger', [
        'family_id'  => $parent['family_id'],
        'child_id'   => $submission['child_id'],
        'delta'      => $points,
        'reason'     => 'chore_approved',
        'ref_id'     => $submission_id,
        'ref_type'   => 'submission',
        'note'       => $note,
        'created_by' => $parent['id'],
    ]);

    // Update streak + check achievements
    update_streak($submission['child_id']);
    check_achievements($submission['child_id'], $parent['family_id']);
}

success(['status' => $status, 'points_awarded' => $action === 'approve' ? $points : 0]);

function update_streak(string $child_id): void {
    $res  = db_select('users', ['id' => 'eq.' . $child_id]);
    $user = $res['data'][0] ?? null;
    if (!$user) return;

    $today     = date('Y-m-d');
    $yesterday = date('Y-m-d', strtotime('-1 day'));
    $last      = $user['last_active'] ?? null;

    $streak = $user['streak'] ?? 0;
    if ($last === $yesterday) {
        $streak++;
    } elseif ($last !== $today) {
        $streak = 1;
    }

    // Level up every 50 points (rough heuristic)
    $ledger = db_select('points_ledger', [
        'child_id' => 'eq.' . $child_id,
        'delta'    => 'gt.0',
        'select'   => 'delta',
    ]);
    $total_points = array_sum(array_column($ledger['data'] ?? [], 'delta'));
    $level = max(1, (int)floor($total_points / 50) + 1);

    db_update('users', ['id' => 'eq.' . $child_id], [
        'streak'      => $streak,
        'last_active' => $today,
        'level'       => $level,
        'updated_at'  => date('c'),
    ]);
}

function check_achievements(string $child_id, string $family_id): void {
    $ledger = db_select('points_ledger', ['child_id' => 'eq.' . $child_id, 'delta' => 'gt.0', 'select' => 'delta']);
    $total_points = array_sum(array_column($ledger['data'] ?? [], 'delta'));

    $subs = db_select('submissions', ['child_id' => 'eq.' . $child_id, 'status' => 'eq.approved', 'select' => 'id']);
    $total_chores = count($subs['data'] ?? []);

    $user_res = db_select('users', ['id' => 'eq.' . $child_id]);
    $user     = $user_res['data'][0] ?? [];
    $streak   = $user['streak'] ?? 0;
    $level    = $user['level'] ?? 1;

    $earned = db_select('user_achievements', ['user_id' => 'eq.' . $child_id, 'select' => 'achievement_id']);
    $earned_ids = array_column($earned['data'] ?? [], 'achievement_id');

    $all_ach = db_select('achievements', []);
    foreach ($all_ach['data'] ?? [] as $ach) {
        if (in_array($ach['id'], $earned_ids)) continue;
        $criteria = $ach['criteria'] ?? [];
        $met = false;
        switch ($criteria['type'] ?? '') {
            case 'chores_completed': $met = $total_chores >= $criteria['threshold']; break;
            case 'streak':           $met = $streak >= $criteria['threshold']; break;
            case 'level':            $met = $level >= $criteria['threshold']; break;
            case 'total_points':     $met = $total_points >= $criteria['threshold']; break;
        }
        if ($met) {
            db_insert('user_achievements', ['user_id' => $child_id, 'achievement_id' => $ach['id']]);
        }
    }
}
