<?php
require_once __DIR__ . '/config.php';

/**
 * Make a request to the Supabase REST API (PostgREST).
 * Uses the service role key so RLS is bypassed — PHP is the trust boundary.
 */
function supabase(
    string $table,
    string $method = 'GET',
    array  $query  = [],
    mixed  $body   = null,
    array  $extra_headers = []
): array {
    $url = rtrim(SUPABASE_URL, '/') . '/rest/v1/' . ltrim($table, '/');

    if (!empty($query)) {
        $url .= '?' . http_build_query($query);
    }

    $headers = [
        'apikey: '        . SUPABASE_SERVICE_KEY,
        'Authorization: Bearer ' . SUPABASE_SERVICE_KEY,
        'Content-Type: application/json',
        'Prefer: return=representation',
    ];

    foreach ($extra_headers as $h) {
        $headers[] = $h;
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => strtoupper($method),
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_TIMEOUT        => 15,
    ]);

    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);

    if ($curl_error) {
        return ['error' => $curl_error, 'status' => 0, 'data' => null];
    }

    $data = json_decode($response, true);
    return ['status' => $http_code, 'data' => $data, 'error' => null];
}

/** Shorthand helpers */
function db_select(string $table, array $query = []): array {
    return supabase($table, 'GET', $query);
}

function db_insert(string $table, array $row): array {
    return supabase($table, 'POST', [], $row);
}

function db_update(string $table, array $query, array $data): array {
    return supabase($table, 'PATCH', $query, $data);
}

function db_delete(string $table, array $query): array {
    return supabase($table, 'DELETE', $query);
}

function db_upsert(string $table, array $row, string $on_conflict = 'id'): array {
    return supabase($table, 'POST', [], $row, ["Prefer: resolution=merge-duplicates,return=representation"]);
}

/**
 * Supabase Auth API wrapper
 */
function supabase_auth(string $path, array $payload): array {
    $url = rtrim(SUPABASE_URL, '/') . '/auth/v1/' . ltrim($path, '/');

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_HTTPHEADER     => [
            'apikey: '      . SUPABASE_ANON_KEY,
            'Content-Type: application/json',
        ],
        CURLOPT_TIMEOUT        => 15,
    ]);

    $response  = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ['status' => $http_code, 'data' => json_decode($response, true)];
}

function supabase_auth_admin(string $path, string $method = 'GET', array $payload = []): array {
    $url = rtrim(SUPABASE_URL, '/') . '/auth/v1/admin/' . ltrim($path, '/');

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_POSTFIELDS     => !empty($payload) ? json_encode($payload) : null,
        CURLOPT_HTTPHEADER     => [
            'apikey: '             . SUPABASE_SERVICE_KEY,
            'Authorization: Bearer ' . SUPABASE_SERVICE_KEY,
            'Content-Type: application/json',
        ],
        CURLOPT_TIMEOUT        => 15,
    ]);

    $response  = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ['status' => $http_code, 'data' => json_decode($response, true)];
}
