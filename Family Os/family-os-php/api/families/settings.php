<?php
// GET/PUT /api/families/settings.php — family settings + economy config
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $user = require_auth();
    $fam  = db_select('families', ['id' => 'eq.' . $user['family_id']]);
    $settings = db_select('family_settings', ['family_id' => 'eq.' . $user['family_id']]);
    success([
        'family'   => $fam['data'][0] ?? null,
        'settings' => $settings['data'][0] ?? null,
    ]);

} elseif ($method === 'PUT' || $method === 'PATCH') {
    $parent = require_parent();
    $b      = body();

    $family_data = [];
    if (isset($b['name']))          $family_data['name']          = trim($b['name']);
    if (isset($b['weekly_budget'])) $family_data['weekly_budget'] = (float)$b['weekly_budget'];
    if (isset($b['point_rate'])) {
        $rate = (float)$b['point_rate'];
        $family_data['point_rate'] = $rate;

        // Recalculate all active coupon points when rate changes
        if ($rate > 0) {
            $coupons = db_select('coupons', ['family_id' => 'eq.' . $parent['family_id'], 'is_active' => 'eq.true']);
            foreach ($coupons['data'] ?? [] as $c) {
                $new_points = (int)round((float)$c['usd_value'] / $rate);
                db_update('coupons', ['id' => 'eq.' . $c['id']], ['points_cost' => $new_points, 'updated_at' => date('c')]);
            }
        }
    }

    if (!empty($family_data)) {
        $family_data['updated_at'] = date('c');
        db_update('families', ['id' => 'eq.' . $parent['family_id']], $family_data);
    }

    $settings_data = [];
    if (isset($b['ai_enabled'])) $settings_data['ai_enabled'] = (bool)$b['ai_enabled'];
    if (isset($b['timezone']))   $settings_data['timezone']   = $b['timezone'];
    if (!empty($settings_data)) {
        $settings_data['updated_at'] = date('c');
        db_update('family_settings', ['family_id' => 'eq.' . $parent['family_id']], $settings_data);
    }

    success(null, 'Settings updated');
} else {
    error('Method not allowed', 405);
}
