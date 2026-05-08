<?php
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();
require_method('GET');

$user = require_auth();

// Load family
$fam    = db_select('families', ['id' => 'eq.' . $user['family_id']]);
$family = $fam['data'][0] ?? null;

// Load achievements for child
$achievements = [];
if ($user['role'] === 'child') {
    $ach = db_select('user_achievements', [
        'user_id' => 'eq.' . $user['id'],
        'select'  => '*,achievement:achievements(*)',
    ]);
    $achievements = $ach['data'] ?? [];
}

success([
    'user'         => $user,
    'family'       => $family,
    'achievements' => $achievements,
]);
