<?php
// GET /api/chores/templates.php?category=kitchen — browse built-in templates
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();
require_method('GET');

require_auth();

$query = ['is_global' => 'eq.true', 'order' => 'category.asc,title.asc'];

if (!empty($_GET['category'])) {
    $query['category'] = 'eq.' . $_GET['category'];
}

$res = db_select('chore_templates', $query);
if ($res['status'] !== 200) error('Failed to load templates', 500);

success($res['data']);
