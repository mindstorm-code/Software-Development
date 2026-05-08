<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/response.php';

/**
 * Decode a Supabase JWT and return the payload.
 * We verify the signature using the JWT_SECRET (your Supabase JWT secret).
 */
function decode_jwt(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    [$header_b64, $payload_b64, $sig_b64] = $parts;

    $sig_check = hash_hmac('sha256', "$header_b64.$payload_b64", JWT_SECRET, true);
    $sig_given  = base64_decode(strtr($sig_b64, '-_', '+/') . str_repeat('=', (4 - strlen($sig_b64) % 4) % 4));

    if (!hash_equals($sig_check, $sig_given)) return null;

    $payload = json_decode(base64_decode(strtr($payload_b64, '-_', '+/') . str_repeat('=', (4 - strlen($payload_b64) % 4) % 4)), true);
    if (!$payload) return null;

    if (isset($payload['exp']) && $payload['exp'] < time()) return null;

    return $payload;
}

/**
 * Extract Bearer token from Authorization header.
 */
function bearer_token(): ?string {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (str_starts_with($auth, 'Bearer ')) {
        return substr($auth, 7);
    }
    return null;
}

/**
 * Require a valid authenticated parent session.
 * Returns the user row from our users table.
 */
function require_parent(): array {
    $token = bearer_token();
    if (!$token) error('Unauthorized', 401);

    $jwt = decode_jwt($token);
    if (!$jwt || empty($jwt['sub'])) error('Unauthorized', 401);

    $res = db_select('users', ['auth_id' => 'eq.' . $jwt['sub'], 'role' => 'eq.parent', 'is_active' => 'eq.true']);
    if ($res['status'] !== 200 || empty($res['data'])) error('Forbidden', 403);

    return $res['data'][0];
}

/**
 * Require any authenticated session (parent or child via PIN token).
 */
function require_auth(): array {
    $token = bearer_token();
    if (!$token) error('Unauthorized', 401);

    // Try Supabase JWT first (parent)
    $jwt = decode_jwt($token);
    if ($jwt && !empty($jwt['sub'])) {
        $res = db_select('users', ['auth_id' => 'eq.' . $jwt['sub'], 'is_active' => 'eq.true']);
        if ($res['status'] === 200 && !empty($res['data'])) {
            return $res['data'][0];
        }
    }

    // Try our internal PIN session token
    $session = verify_pin_token($token);
    if ($session) return $session;

    error('Unauthorized', 401);
}

/**
 * Generate a signed PIN session token for children.
 * Format: base64(payload).base64(hmac)
 */
function generate_pin_token(string $user_id, string $family_id): string {
    $payload = json_encode([
        'uid' => $user_id,
        'fid' => $family_id,
        'iat' => time(),
        'exp' => time() + (30 * 24 * 3600), // 30 days
        'typ' => 'pin',
    ]);
    $b64     = base64_encode($payload);
    $sig     = base64_encode(hash_hmac('sha256', $b64, JWT_SECRET, true));
    return "$b64.$sig";
}

function verify_pin_token(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 2) return null;

    [$b64, $sig] = $parts;
    $expected = base64_encode(hash_hmac('sha256', $b64, JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return null;

    $payload = json_decode(base64_decode($b64), true);
    if (!$payload || ($payload['typ'] ?? '') !== 'pin') return null;
    if ($payload['exp'] < time()) return null;

    $res = db_select('users', ['id' => 'eq.' . $payload['uid'], 'is_active' => 'eq.true']);
    if ($res['status'] !== 200 || empty($res['data'])) return null;

    return $res['data'][0];
}

/**
 * Hash a PIN with bcrypt.
 */
function hash_pin(string $pin): string {
    return password_hash($pin, PASSWORD_BCRYPT, ['cost' => 10]);
}

function verify_pin(string $pin, string $hash): bool {
    return password_verify($pin, $hash);
}
