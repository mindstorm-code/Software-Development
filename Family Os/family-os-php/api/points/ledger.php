<?php
// GET /api/points/ledger.php?child_id=<uuid> — get balance + ledger history
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();
require_method('GET');

$user      = require_auth();
$child_id  = $_GET['child_id'] ?? ($user['role'] === 'child' ? $user['id'] : null);

if (!$child_id) error('child_id is required');

// Parents can query any child in their family; children only themselves
if ($user['role'] === 'child' && $child_id !== $user['id']) {
    error('Forbidden', 403);
}
if ($user['role'] === 'parent') {
    $child_check = db_select('users', ['id' => 'eq.' . $child_id, 'family_id' => 'eq.' . $user['family_id']]);
    if (empty($child_check['data'])) error('Child not found', 404);
}

$res = db_select('points_ledger', [
    'child_id' => 'eq.' . $child_id,
    'order'    => 'created_at.desc',
    'limit'    => $_GET['limit'] ?? 100,
]);

$entries = $res['data'] ?? [];
$balance = array_sum(array_column($entries, 'delta'));
$earned  = array_sum(array_filter(array_column($entries, 'delta'), fn($d) => $d > 0));
$spent   = abs(array_sum(array_filter(array_column($entries, 'delta'), fn($d) => $d < 0)));

success([
    'balance' => $balance,
    'earned'  => $earned,
    'spent'   => $spent,
    'entries' => $entries,
]);
