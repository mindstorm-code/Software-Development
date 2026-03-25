<?php
// submit.php
// Handles quiz submission, calculates scores, stores results, and redirects.

// Debugging (turn off in production)
error_reporting(E_ALL);
ini_set("display_errors", "1");

require_once "db_connect.php";

function clean_text($value)
{
    return trim($value ?? "");
}

// Contact info
$name = clean_text($_POST["name"] ?? "");
$email = clean_text($_POST["email"] ?? "");
$phone = clean_text($_POST["phone"] ?? "");

if ($name === "" || $email === "") {
    die("Name and email are required. Please go back and try again.");
}

// Collect and validate answers
$answers = [];
$missing = [];
$invalid = [];

for ($i = 1; $i <= 10; $i++) {
    $key = "q" . $i;
    if (!isset($_POST[$key]) || $_POST[$key] === "") {
        $missing[] = $key;
        continue;
    }

    $value = (int)$_POST[$key];
    if ($value < 1 || $value > 5) {
        $invalid[] = $key;
    }
    $answers[$key] = $value;
}

if (!empty($missing) || !empty($invalid)) {
    die("All questions must be answered with a value from 1 to 5. Please go back and try again.");
}

// Scoring (each question maps to one type)
$pioneer_score = $answers["q1"] + $answers["q6"];
$harmonizer_score = $answers["q2"] + $answers["q7"];
$analyzer_score = $answers["q3"] + $answers["q8"];
$stabilizer_score = $answers["q4"] + $answers["q9"];
$energizer_score = $answers["q5"] + $answers["q10"];

$type_scores = [
    "pioneer" => $pioneer_score,
    "harmonizer" => $harmonizer_score,
    "analyzer" => $analyzer_score,
    "stabilizer" => $stabilizer_score,
    "energizer" => $energizer_score,
];

// Tie-break order: pioneer, harmonizer, analyzer, stabilizer, energizer
$priority = ["pioneer", "harmonizer", "analyzer", "stabilizer", "energizer"];
$primary_type = $priority[0];
$max_score = $type_scores[$primary_type];

foreach ($priority as $type) {
    if ($type_scores[$type] > $max_score) {
        $max_score = $type_scores[$type];
        $primary_type = $type;
    }
}

// Insert into the database
$sql = "INSERT INTO results
    (name, email, phone, pioneer_score, harmonizer_score, analyzer_score, stabilizer_score, energizer_score, primary_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    die("Database prepare failed: " . $conn->error);
}

$stmt->bind_param(
    "sssiiiiis",
    $name,
    $email,
    $phone,
    $pioneer_score,
    $harmonizer_score,
    $analyzer_score,
    $stabilizer_score,
    $energizer_score,
    $primary_type
);

if (!$stmt->execute()) {
    die("Database insert failed: " . $stmt->error);
}

$new_id = $stmt->insert_id;
$stmt->close();
$conn->close();

// Redirect to results page
header("Location: results.php?id=" . $new_id);
exit;
?>
