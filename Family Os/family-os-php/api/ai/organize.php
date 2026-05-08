<?php
// POST /api/ai/organize.php — AI room/space organization guidance from photo
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/response.php';
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();
require_method('POST');

require_auth();
$b = body();

$photo_url = $b['photo_url'] ?? '';
$space     = $b['space']     ?? 'room'; // 'room', 'closet', 'desk', 'bathroom', etc.

if (!$photo_url) error('photo_url is required');

if (!OPENAI_API_KEY) {
    success(mock_organize_result($space), 'AI unavailable — returning example plan');
}

$messages = [
    [
        'role'    => 'system',
        'content' => 'You are a friendly organization coach for children ages 6-18. Look at the photo of their space and give simple, actionable steps to organize it. Use encouraging language. Keep steps short and numbered. Respond in JSON only.',
    ],
    [
        'role'    => 'user',
        'content' => [
            ['type' => 'text', 'text' => "Please analyze this photo of my $space and give me a step-by-step plan to organize it. Respond with JSON: {\"title\":\"Organization Plan\",\"steps\":[{\"step\":1,\"action\":\"brief action\",\"tip\":\"helpful tip\"}],\"encouragement\":\"motivating message\",\"estimated_minutes\":15}"],
            ['type' => 'image_url', 'image_url' => ['url' => $photo_url, 'detail' => 'low']],
        ],
    ],
];

$payload = ['model' => 'gpt-4o-mini', 'messages' => $messages, 'max_tokens' => 500, 'temperature' => 0.5];

$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($payload),
    CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . OPENAI_API_KEY, 'Content-Type: application/json'],
    CURLOPT_TIMEOUT        => 30,
]);

$response  = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code !== 200) {
    success(mock_organize_result($space), 'AI unavailable — returning example plan');
}

$data    = json_decode($response, true);
$content = $data['choices'][0]['message']['content'] ?? '{}';
$content = preg_replace('/^```json\s*/m', '', $content);
$content = preg_replace('/^```\s*/m', '', $content);
$result  = json_decode(trim($content), true) ?? mock_organize_result($space);

success($result);

function mock_organize_result(string $space): array {
    return [
        'title' => 'Organization Plan for Your ' . ucfirst($space),
        'steps' => [
            ['step' => 1, 'action' => 'Clear everything off the floor', 'tip' => 'Make one big pile — don\'t sort yet!'],
            ['step' => 2, 'action' => 'Sort into 3 piles: keep, put away, trash', 'tip' => 'If you haven\'t used it in 3 months, consider donating it'],
            ['step' => 3, 'action' => 'Put trash in the bin right away', 'tip' => 'This makes the pile much smaller fast'],
            ['step' => 4, 'action' => 'Put away the "put away" pile', 'tip' => 'Everything has a home — find it!'],
            ['step' => 5, 'action' => 'Organize what\'s left by type or color', 'tip' => 'Group similar things together so they\'re easy to find'],
        ],
        'encouragement'      => 'You\'ve got this! A tidy space = a tidy mind. You\'ll feel so much better when it\'s done!',
        'estimated_minutes'  => 20,
    ];
}
