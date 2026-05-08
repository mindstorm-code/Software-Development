<?php
// POST /api/ai/verify.php — verify chore photo via OpenAI vision
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();
require_method('POST');

require_auth();
$b = body();

$submitted_urls  = $b['submitted_urls']  ?? [];
$after_photo_url = $b['after_photo_url'] ?? null;
$chore_title     = $b['chore_title']     ?? 'chore';
$checklist       = $b['checklist']       ?? [];

if (empty($submitted_urls)) error('submitted_urls is required');

if (!OPENAI_API_KEY) {
    // Demo fallback
    success(mock_result(), 'AI verification (demo mode)');
}

// Build vision messages
$messages = [[
    'role'    => 'system',
    'content' => 'You are a chore verification assistant for a family app. Evaluate whether a child has correctly completed the assigned chore based on the submitted photo(s). Be fair and encouraging but honest. Respond in JSON only.',
]];

$user_content = [
    ['type' => 'text', 'text' => "Chore: \"$chore_title\"\n" .
        (!empty($checklist) ? "Checklist: " . implode(', ', array_column($checklist, 'text')) . "\n" : '') .
        ($after_photo_url ? "Expected result (reference photo provided).\n" : '') .
        "Submitted photo(s) below. Respond with JSON: {\"status\":\"approved|needs_review|rejected\",\"confidence\":0.0-1.0,\"reasoning\":\"brief explanation\",\"feedback\":\"encouraging message to the child\"}"
    ],
];

foreach ($submitted_urls as $url) {
    $user_content[] = ['type' => 'image_url', 'image_url' => ['url' => $url, 'detail' => 'low']];
}

if ($after_photo_url) {
    $user_content[] = ['type' => 'text', 'text' => 'Reference/expected result:'];
    $user_content[] = ['type' => 'image_url', 'image_url' => ['url' => $after_photo_url, 'detail' => 'low']];
}

$messages[] = ['role' => 'user', 'content' => $user_content];

$payload = [
    'model'       => 'gpt-4o-mini',
    'messages'    => $messages,
    'max_tokens'  => 300,
    'temperature' => 0.3,
];

$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($payload),
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . OPENAI_API_KEY,
        'Content-Type: application/json',
    ],
    CURLOPT_TIMEOUT        => 30,
]);

$response  = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code !== 200) {
    success(mock_result(), 'AI unavailable — returning estimate');
}

$data    = json_decode($response, true);
$content = $data['choices'][0]['message']['content'] ?? '{}';

// Strip markdown code fences if present
$content = preg_replace('/^```json\s*/m', '', $content);
$content = preg_replace('/^```\s*/m', '', $content);
$result  = json_decode(trim($content), true) ?? mock_result();

success($result);

function mock_result(): array {
    return [
        'status'     => 'needs_review',
        'confidence' => 0.62,
        'reasoning'  => 'AI verification unavailable — photo submitted for parent review.',
        'feedback'   => 'Great job submitting your chore! Your parent will review it shortly.',
    ];
}
