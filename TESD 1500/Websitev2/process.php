<?php
// =============================
// process.php — PHASE + MBTI + EOS scoring + file I/O
// =============================

// Helper: safe read from POST
function post_value(string $key, string $default = ""): string {
  return isset($_POST[$key]) ? trim((string)$_POST[$key]) : $default;
}

$name  = post_value("name", "Guest");
$email = post_value("email", "Not provided");

$timestamp = date("Y-m-d H:i:s");

// =====================
// PHASE SCORING (q1–q5)
// =====================
$phaseScores = [
  "Pioneer" => 0,
  "Harmonizer" => 0,
  "Analyzer" => 0,
  "Stabilizer" => 0,
  "Energizer" => 0
];

for ($i = 1; $i <= 5; $i++) {
  $ans = post_value("q$i", "");
  if (isset($phaseScores[$ans])) {
    $phaseScores[$ans]++;
  }
}

arsort($phaseScores);
$phaseTypes = array_keys($phaseScores);
$phasePrimary   = $phaseTypes[0] ?? "Unknown";
$phaseSecondary = $phaseTypes[1] ?? "Unknown";

// Simple descriptions (short + practical)
$phaseDesc = [
  "Pioneer"    => "Visionary builder. Starts new things, sees possibilities fast.",
  "Harmonizer" => "Relationship builder. Creates trust, reduces conflict.",
  "Analyzer"   => "Strategic thinker. Loves accuracy, logic, and systems.",
  "Stabilizer" => "Reliable organizer. Executes, maintains consistency.",
  "Energizer"  => "Motivator. Brings enthusiasm, communication, momentum."
];

// =====================
// MBTI SCORING (mb1–mb5)
// =====================
$mbtiScores = ["I"=>0,"E"=>0,"S"=>0,"N"=>0,"T"=>0,"F"=>0,"J"=>0,"P"=>0];

for ($i = 1; $i <= 5; $i++) {
  $ans = post_value("mb$i", "");
  if (isset($mbtiScores[$ans])) {
    $mbtiScores[$ans]++;
  }
}

// Decide each pair (ties break toward first option)
$mbti_ie = ($mbtiScores["I"] >= $mbtiScores["E"]) ? "I" : "E";
$mbti_sn = ($mbtiScores["S"] >= $mbtiScores["N"]) ? "S" : "N";
$mbti_tf = ($mbtiScores["T"] >= $mbtiScores["F"]) ? "T" : "F";
$mbti_jp = ($mbtiScores["J"] >= $mbtiScores["P"]) ? "J" : "P";

$mbti = $mbti_ie . $mbti_sn . $mbti_tf . $mbti_jp;

// Confidence (optional but nice): strongest pair margin
$mbtiConfidence = max(
  abs($mbtiScores["I"] - $mbtiScores["E"]),
  abs($mbtiScores["S"] - $mbtiScores["N"]),
  abs($mbtiScores["T"] - $mbtiScores["F"]),
  abs($mbtiScores["J"] - $mbtiScores["P"])
);

// =====================
// EOS SCORING (e1–e5)
// V = Visionary (future)
// I = Integrator (past patterns + alignment)
// T = Technician (present execution)
// =====================
$eosScores = ["Visionary"=>0, "Integrator"=>0, "Technician"=>0];

for ($i = 1; $i <= 5; $i++) {
  $ans = post_value("e$i", "");
  if ($ans === "V") $eosScores["Visionary"]++;
  if ($ans === "I") $eosScores["Integrator"]++;
  if ($ans === "T") $eosScores["Technician"]++;
}

arsort($eosScores);
$eosTypes = array_keys($eosScores);
$eosPrimary = $eosTypes[0] ?? "Unknown";
$eosSecondary = $eosTypes[1] ?? "Unknown";

$eosDesc = [
  "Visionary"   => "Future-focused. Big ideas, direction, opportunities.",
  "Integrator"  => "Alignment-focused. Turns vision into a coordinated plan.",
  "Technician"  => "Execution-focused. Builds, fixes, ships real work."
];

// =====================
// FILE I/O (assignment)
// =====================
$filename = "assessment_results.txt";
$fp = fopen($filename, "a"); // 1) OPEN file

$saved = false;
$error = "";

// One-line entry for easy grading
$line =
  $timestamp
  . " | Name: " . $name
  . " | Email: " . $email
  . " | PHASE: " . $phasePrimary . " + " . $phaseSecondary
  . " | PHASE Scores: Pio=" . $phaseScores["Pioneer"]
  . " Har=" . $phaseScores["Harmonizer"]
  . " Ana=" . $phaseScores["Analyzer"]
  . " Sta=" . $phaseScores["Stabilizer"]
  . " Eng=" . $phaseScores["Energizer"]
  . " | MBTI: " . $mbti
  . " | MBTI Scores: I=" . $mbtiScores["I"] . " E=" . $mbtiScores["E"]
  . " S=" . $mbtiScores["S"] . " N=" . $mbtiScores["N"]
  . " T=" . $mbtiScores["T"] . " F=" . $mbtiScores["F"]
  . " J=" . $mbtiScores["J"] . " P=" . $mbtiScores["P"]
  . " | EOS: " . $eosPrimary . " + " . $eosSecondary
  . " | EOS Scores: V=" . $eosScores["Visionary"] . " I=" . $eosScores["Integrator"] . " T=" . $eosScores["Technician"]
  . "\n";

if (!$fp) {
  $error = "Could not open file for writing. Check permissions.";
} else {
  fwrite($fp, $line);   // 2) WRITE to file
  fclose($fp);          // 3) CLOSE file
  $saved = true;
}

// 4) READ from file
$all_data = file_exists($filename) ? file_get_contents($filename) : "";

// Most recent entry
$last_entry = "";
if ($all_data !== "") {
  $lines = array_values(array_filter(explode("\n", $all_data), fn($l) => trim($l) !== ""));
  $last_entry = end($lines) ?: "";
}
?>
<!doctype html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Your Results</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>Assessment Results</h1>

      <?php if ($saved): ?>
        <p class="ok"><strong>Saved.</strong> Results written to <code><?= htmlspecialchars($filename) ?></code></p>
      <?php else: ?>
        <p class="bad"><strong>Not saved.</strong> <?= htmlspecialchars($error) ?></p>
      <?php endif; ?>

      <h2><?= htmlspecialchars($name) ?></h2>

      <h3>PHASE Personalities™</h3>
      <p class="big"><strong>Primary:</strong> <?= htmlspecialchars($phasePrimary) ?></p>
      <p><strong>Secondary:</strong> <?= htmlspecialchars($phaseSecondary) ?></p>

      <div class="pillrow">
        <span class="pill">Pioneer: <?= (int)$phaseScores["Pioneer"] ?></span>
        <span class="pill">Harmonizer: <?= (int)$phaseScores["Harmonizer"] ?></span>
        <span class="pill">Analyzer: <?= (int)$phaseScores["Analyzer"] ?></span>
        <span class="pill">Stabilizer: <?= (int)$phaseScores["Stabilizer"] ?></span>
        <span class="pill">Energizer: <?= (int)$phaseScores["Energizer"] ?></span>
      </div>

      <ul class="results">
        <li><strong><?= htmlspecialchars($phasePrimary) ?>:</strong> <?= htmlspecialchars($phaseDesc[$phasePrimary] ?? "") ?></li>
        <li><strong><?= htmlspecialchars($phaseSecondary) ?>:</strong> <?= htmlspecialchars($phaseDesc[$phaseSecondary] ?? "") ?></li>
      </ul>

      <h3>MBTI</h3>
      <p class="big"><strong>Your Type:</strong> <?= htmlspecialchars($mbti) ?></p>
      <p class="sub">Confidence (rough): <?= (int)$mbtiConfidence ?> (bigger = stronger preference)</p>

      <div class="pillrow">
        <span class="pill">I <?= (int)$mbtiScores["I"] ?> / E <?= (int)$mbtiScores["E"] ?></span>
        <span class="pill">S <?= (int)$mbtiScores["S"] ?> / N <?= (int)$mbtiScores["N"] ?></span>
        <span class="pill">T <?= (int)$mbtiScores["T"] ?> / F <?= (int)$mbtiScores["F"] ?></span>
        <span class="pill">J <?= (int)$mbtiScores["J"] ?> / P <?= (int)$mbtiScores["P"] ?></span>
      </div>

      <h3>EOS Role</h3>
      <p class="big"><strong>Primary:</strong> <?= htmlspecialchars($eosPrimary) ?></p>
      <p><strong>Secondary:</strong> <?= htmlspecialchars($eosSecondary) ?></p>

      <ul class="results">
        <li><strong><?= htmlspecialchars($eosPrimary) ?>:</strong> <?= htmlspecialchars($eosDesc[$eosPrimary] ?? "") ?></li>
        <li><strong><?= htmlspecialchars($eosSecondary) ?>:</strong> <?= htmlspecialchars($eosDesc[$eosSecondary] ?? "") ?></li>
      </ul>

      <div class="pillrow">
        <span class="pill">Visionary: <?= (int)$eosScores["Visionary"] ?></span>
        <span class="pill">Integrator: <?= (int)$eosScores["Integrator"] ?></span>
        <span class="pill">Technician: <?= (int)$eosScores["Technician"] ?></span>
      </div>

      <?php if ($last_entry !== ""): ?>
        <h3>Last Saved Entry (From File)</h3>
        <pre class="filebox"><?= htmlspecialchars($last_entry) ?></pre>
      <?php endif; ?>

      <h3>All Saved Entries (From File)</h3>
      <?php if ($all_data === ""): ?>
        <p>No saved entries found yet.</p>
      <?php else: ?>
        <pre class="filebox"><?= htmlspecialchars($all_data) ?></pre>
      <?php endif; ?>

      <p><a href="index.html">Back to the form</a></p>
    </div>
  </div>
</body>
</html>echo "";