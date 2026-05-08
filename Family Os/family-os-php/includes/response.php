<?php
function json_response(mixed $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function success(mixed $data = null, string $message = 'OK', int $status = 200): never {
    json_response(['success' => true, 'message' => $message, 'data' => $data], $status);
}

function error(string $message, int $status = 400, mixed $details = null): never {
    json_response(['success' => false, 'message' => $message, 'details' => $details], $status);
}

function body(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

function require_method(string ...$methods): void {
    if (!in_array($_SERVER['REQUEST_METHOD'], $methods, true)) {
        error('Method not allowed', 405);
    }
}
