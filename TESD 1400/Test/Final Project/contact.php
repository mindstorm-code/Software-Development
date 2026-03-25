<?php
// contact.php
// PHASE quiz flow on a single page: contact info -> choose version -> quiz -> results.

// Debugging (turn off in production)
error_reporting(E_ALL);
ini_set("display_errors", "1");

require_once "db_connect.php";

function h($value)
{
    return htmlspecialchars($value ?? "", ENT_QUOTES, "UTF-8");
}

function clean_text($value)
{
    return trim($value ?? "");
}

$scale = [
    1 => "Strongly Disagree",
    2 => "Disagree",
    3 => "Neutral",
    4 => "Agree",
    5 => "Strongly Agree",
];

$types = [
    "pioneer" => [
        "name" => "Pioneer",
        "short" => "Visionary / initiator",
        "archetype" => "Lion",
        "colorName" => "Red",
        "deepStrengths" => [
            "Sees future possibilities before others do and is willing to move first.",
            "Brings entrepreneurial courage, fresh thinking, and idea generation to teams.",
            "Can create momentum when a group is stuck in old systems or fear.",
            "Often excels in innovation, launch phases, vision casting, and creative problem solving.",
            "Pushes people to imagine what could be instead of accepting what already is.",
        ],
        "deepWatchouts" => [
            "Can move so fast that details, process, or people's pacing get overlooked.",
            "May lose interest once the excitement of starting fades and maintenance begins.",
            "Can sound impatient when others need more certainty before acting.",
            "May underestimate how much structure is needed to turn a dream into a durable system.",
            "Under stress, can chase the next big thing rather than finish the current one.",
        ],
        "teamwork" => "Pioneers work best when they have freedom to create, challenge assumptions, and explore options. They are often complemented by Stabilizers who create order, Analyzers who test the logic, Harmonizers who keep people connected, and Energizers who rally support around the idea.",
        "science" => "Closest overlaps: high Openness in Big Five, some DISC D/I patterns, and innovative or entrepreneurial leadership styles.",
        "idealPartners" => [
            "Stabilizer for execution",
            "Analyzer for strategy and risk checking",
            "Harmonizer for people impact",
        ],
    ],
    "harmonizer" => [
        "name" => "Harmonizer",
        "short" => "Empath / connector",
        "archetype" => "Dog",
        "colorName" => "Blue",
        "deepStrengths" => [
            "Reads emotional tone well and notices when people feel unseen, unsafe, or disconnected.",
            "Builds trust, belonging, and relational safety inside groups and families.",
            "Often acts as a peacemaker who helps conflict become productive instead of destructive.",
            "Brings compassion, empathy, and a people-first lens to leadership decisions.",
            "Can help teams stay human while pursuing performance and goals.",
        ],
        "deepWatchouts" => [
            "May avoid necessary conflict for too long in order to keep peace.",
            "Can absorb other people's feelings and become emotionally overloaded.",
            "Sometimes delays hard truth because they do not want to hurt someone.",
            "May prioritize harmony so much that accountability becomes soft or unclear.",
            "Under stress, can withdraw, over-accommodate, or feel responsible for everyone's emotions.",
        ],
        "teamwork" => "Harmonizers work best in environments with trust, respect, and healthy communication.",
        "science" => "Closest overlaps: high Agreeableness in Big Five and relationship-oriented leadership.",
        "idealPartners" => [
            "Analyzer for objectivity",
            "Pioneer for bold direction",
            "Stabilizer for consistency",
        ],
    ],
    "analyzer" => [
        "name" => "Analyzer",
        "short" => "Strategist / thinker",
        "archetype" => "Owl",
        "colorName" => "Purple",
        "deepStrengths" => [
            "Brings logic, precision, and thoughtful reasoning to decisions.",
            "Finds patterns, inconsistencies, and hidden risks that other people miss.",
            "Excels at research, systems thinking, planning, and breaking down complexity.",
            "Strengthens quality by asking good questions before a team acts too fast.",
            "Helps turn vague ideas into clearer models, plans, and strategies.",
        ],
        "deepWatchouts" => [
            "Can overanalyze and slow momentum when quick action is needed.",
            "May sound overly skeptical or critical when trying to improve something.",
            "Sometimes trusts data more easily than people's emotional reality.",
            "May hesitate to act until they feel they have enough certainty.",
            "Under stress, can detach, get stuck in thinking loops, or focus too much on flaws.",
        ],
        "teamwork" => "Analyzers work best when they have clarity, time to think, and access to meaningful information.",
        "science" => "Closest overlaps: analytical problem solving and high conscientious thinking styles.",
        "idealPartners" => [
            "Energizer for momentum",
            "Harmonizer for relational delivery",
            "Pioneer for fresh ideas",
        ],
    ],
    "stabilizer" => [
        "name" => "Stabilizer",
        "short" => "Organizer / finisher",
        "archetype" => "Bear",
        "colorName" => "Green",
        "deepStrengths" => [
            "Creates order, reliability, and trust through consistent follow-through.",
            "Brings systems, routines, and discipline that help teams finish what they start.",
            "Often becomes the backbone of execution because people know they can be counted on.",
            "Helps reduce chaos by clarifying roles, process, expectations, and timelines.",
            "Protects long-term stability when others get distracted by novelty or emotion.",
        ],
        "deepWatchouts" => [
            "Can resist change when it feels sudden or messy.",
            "May prefer proven methods so much that innovation gets slowed down.",
            "Sometimes becomes rigid when stress rises.",
            "Can carry too much responsibility rather than delegating.",
            "Under pressure, may focus on control instead of adaptability.",
        ],
        "teamwork" => "Stabilizers work best when there are clear expectations and dependable systems.",
        "science" => "Closest overlaps: high Conscientiousness and dependable execution styles.",
        "idealPartners" => [
            "Pioneer for innovation",
            "Energizer for morale",
            "Harmonizer for connection",
        ],
    ],
    "energizer" => [
        "name" => "Energizer",
        "short" => "Motivator / catalyst",
        "archetype" => "Dolphin",
        "colorName" => "Yellow",
        "deepStrengths" => [
            "Creates enthusiasm, visibility, and momentum in people and projects.",
            "Often inspires others to act when motivation is low.",
            "Brings warmth, encouragement, and persuasive communication.",
            "Can rally attention around a mission.",
            "Thrives in dynamic spaces where motivation matters.",
        ],
        "deepWatchouts" => [
            "Can overcommit or move too fast.",
            "May struggle with repetitive tasks.",
            "Sometimes prioritizes energy without checking the plan.",
            "Can become scattered with too many opportunities.",
            "Under stress may seek stimulation or distraction.",
        ],
        "teamwork" => "Energizers work best when they can communicate, encourage, and build momentum.",
        "science" => "Closest overlaps: high Extraversion and influence-based leadership.",
        "idealPartners" => [
            "Analyzer for focus",
            "Stabilizer for structure",
            "Pioneer for vision",
        ],
    ],
];

$youth_questions = [
    ["id" => 1, "type" => "pioneer", "text" => "I enjoy starting new ideas more than following the same old way."],
    ["id" => 2, "type" => "harmonizer", "text" => "I usually notice when someone feels left out."],
    ["id" => 3, "type" => "analyzer", "text" => "I like to think things through before deciding."],
    ["id" => 4, "type" => "stabilizer", "text" => "I like clear plans and knowing what to expect."],
    ["id" => 5, "type" => "energizer", "text" => "I bring energy to a group."],
    ["id" => 6, "type" => "pioneer", "text" => "I get excited about new possibilities."],
    ["id" => 7, "type" => "harmonizer", "text" => "I care a lot about my friendships."],
    ["id" => 8, "type" => "analyzer", "text" => "I like solving problems step by step."],
    ["id" => 9, "type" => "stabilizer", "text" => "People can count on me to finish what I start."],
    ["id" => 10, "type" => "energizer", "text" => "I like cheering people on when they feel down."],
    ["id" => 11, "type" => "pioneer", "text" => "I am willing to try something new even if it feels risky."],
    ["id" => 12, "type" => "harmonizer", "text" => "I often try to help people get along."],
    ["id" => 13, "type" => "analyzer", "text" => "I ask questions to understand things better."],
    ["id" => 14, "type" => "stabilizer", "text" => "I like to finish one task before starting another."],
    ["id" => 15, "type" => "energizer", "text" => "I enjoy talking in front of groups."],
    ["id" => 16, "type" => "pioneer", "text" => "I would rather create something new than copy what already exists."],
    ["id" => 17, "type" => "harmonizer", "text" => "I think about how my choices affect other people."],
    ["id" => 18, "type" => "analyzer", "text" => "I trust facts and evidence when making choices."],
    ["id" => 19, "type" => "stabilizer", "text" => "I help groups stay organized."],
    ["id" => 20, "type" => "energizer", "text" => "I like getting people excited about a goal."],
    ["id" => 21, "type" => "pioneer", "text" => "I like challenging old ways when I think there is a better one."],
    ["id" => 22, "type" => "harmonizer", "text" => "People often come to me when they need support."],
    ["id" => 23, "type" => "analyzer", "text" => "I compare different choices before I decide."],
    ["id" => 24, "type" => "stabilizer", "text" => "I do better when rules and expectations are clear."],
    ["id" => 25, "type" => "energizer", "text" => "My excitement often helps others take action."],
];

$adult_questions = [
    ["id" => 1, "type" => "pioneer", "text" => "I enjoy initiating new ideas more than maintaining legacy systems."],
    ["id" => 2, "type" => "harmonizer", "text" => "I quickly notice relational tension or exclusion in a group."],
    ["id" => 3, "type" => "analyzer", "text" => "I prefer studying the facts before making a decision."],
    ["id" => 4, "type" => "stabilizer", "text" => "I prefer clear plans, structure, and predictable execution."],
    ["id" => 5, "type" => "energizer", "text" => "I naturally create energy and momentum in a room."],
    ["id" => 6, "type" => "pioneer", "text" => "I am energized by possibilities that others have not yet considered."],
    ["id" => 7, "type" => "harmonizer", "text" => "I care deeply about preserving trust and healthy relationships."],
    ["id" => 8, "type" => "analyzer", "text" => "I enjoy solving complex problems step by step."],
    ["id" => 9, "type" => "stabilizer", "text" => "People know they can rely on me for follow-through."],
    ["id" => 10, "type" => "energizer", "text" => "I like encouraging people when morale is slipping."],
    ["id" => 11, "type" => "pioneer", "text" => "I am comfortable taking calculated risks if the goal is worthwhile."],
    ["id" => 12, "type" => "harmonizer", "text" => "I often help reduce tension and restore connection between people."],
    ["id" => 13, "type" => "analyzer", "text" => "I ask questions until I understand the deeper logic of a situation."],
    ["id" => 14, "type" => "stabilizer", "text" => "I prefer completing key priorities before opening new ones."],
    ["id" => 15, "type" => "energizer", "text" => "I am comfortable speaking in front of teams or groups."],
    ["id" => 16, "type" => "pioneer", "text" => "I would rather build a new model than only improve an old one."],
    ["id" => 17, "type" => "harmonizer", "text" => "I think carefully about how choices affect people emotionally."],
    ["id" => 18, "type" => "analyzer", "text" => "I trust logic and evidence more than impulse."],
    ["id" => 19, "type" => "stabilizer", "text" => "I help teams stay organized, accountable, and on track."],
    ["id" => 20, "type" => "energizer", "text" => "I enjoy rallying people around a mission or goal."],
    ["id" => 21, "type" => "pioneer", "text" => "I challenge the status quo when I believe a better path exists."],
    ["id" => 22, "type" => "harmonizer", "text" => "People often come to me when they need support or perspective."],
    ["id" => 23, "type" => "analyzer", "text" => "I like comparing several options before choosing one."],
    ["id" => 24, "type" => "stabilizer", "text" => "I perform best when expectations are explicit and roles are clear."],
    ["id" => 25, "type" => "energizer", "text" => "My enthusiasm often helps others move into action."],
    ["id" => 26, "type" => "pioneer", "text" => "I think more about what could be than what already is."],
    ["id" => 27, "type" => "harmonizer", "text" => "I value cooperation more than competition."],
    ["id" => 28, "type" => "analyzer", "text" => "I like breaking large problems into smaller parts."],
    ["id" => 29, "type" => "stabilizer", "text" => "I prefer dependable systems over frequent change."],
    ["id" => 30, "type" => "energizer", "text" => "I enjoy celebrating progress and wins with a team."],
    ["id" => 31, "type" => "pioneer", "text" => "I quickly spot opportunity inside challenge or uncertainty."],
    ["id" => 32, "type" => "harmonizer", "text" => "I work hard to make people feel seen, safe, and valued."],
    ["id" => 33, "type" => "analyzer", "text" => "I feel satisfied when ideas and systems make logical sense."],
    ["id" => 34, "type" => "stabilizer", "text" => "I take pride in being steady, reliable, and dependable."],
    ["id" => 35, "type" => "energizer", "text" => "I often help others stay hopeful during hard seasons."],
    ["id" => 36, "type" => "pioneer", "text" => "I get restless when there is no room for creativity or innovation."],
    ["id" => 37, "type" => "harmonizer", "text" => "I usually try to understand both sides of a conflict."],
    ["id" => 38, "type" => "analyzer", "text" => "I enjoy research, evaluation, and careful thinking."],
    ["id" => 39, "type" => "stabilizer", "text" => "I like systems that keep work orderly and repeatable."],
    ["id" => 40, "type" => "energizer", "text" => "I am often the one who gets people moving."],
    ["id" => 41, "type" => "pioneer", "text" => "I am drawn to bold ideas and future possibilities."],
    ["id" => 42, "type" => "harmonizer", "text" => "I feel responsible for the emotional climate of a group."],
    ["id" => 43, "type" => "analyzer", "text" => "I catch inconsistencies that others often miss."],
    ["id" => 44, "type" => "stabilizer", "text" => "I stay committed even when the work becomes repetitive."],
    ["id" => 45, "type" => "energizer", "text" => "I like using encouragement to build momentum."],
    ["id" => 46, "type" => "pioneer", "text" => "I prefer freedom to explore over rigid rules."],
    ["id" => 47, "type" => "harmonizer", "text" => "I want people around me to feel respected and emotionally safe."],
    ["id" => 48, "type" => "analyzer", "text" => "I tend to think carefully before I speak or act."],
    ["id" => 49, "type" => "stabilizer", "text" => "I create order when situations feel chaotic."],
    ["id" => 50, "type" => "energizer", "text" => "I feel energized when I can inspire other people."],
];

$question_sets = [
    "youth" => [
        "key" => "youth",
        "label" => "Student / Youth Version",
        "description" => "Simpler wording for students, teens, youth programs, and school leadership groups.",
        "questions" => $youth_questions,
    ],
    "adult" => [
        "key" => "adult",
        "label" => "Adult Leadership Version",
        "description" => "Leadership-centered wording for adults, teams, workplaces, and coaching settings.",
        "questions" => $adult_questions,
    ],
];

$priority = ["pioneer", "harmonizer", "analyzer", "stabilizer", "energizer"];

function build_results($answers, $active_questions, $types, $priority)
{
    $raw = [];
    $counts = [];
    foreach ($types as $key => $type) {
        $raw[$key] = 0;
        $counts[$key] = 0;
    }

    $question_map = [];
    foreach ($active_questions as $q) {
        $question_map[$q["id"]] = $q["type"];
        $counts[$q["type"]] = $counts[$q["type"]] + 1;
    }

    foreach ($answers as $id => $value) {
        if (isset($question_map[$id])) {
            $raw[$question_map[$id]] += $value;
        }
    }

    $results = [];
    foreach ($raw as $key => $score) {
        $max = $counts[$key] * 5;
        $percent = $max > 0 ? round(($score / $max) * 100) : 0;
        $results[] = array_merge(
            [
                "key" => $key,
                "score" => $score,
                "percent" => $percent,
            ],
            $types[$key]
        );
    }

    usort($results, function ($a, $b) use ($priority) {
        if ($a["score"] === $b["score"]) {
            $a_index = array_search($a["key"], $priority, true);
            $b_index = array_search($b["key"], $priority, true);
            return $a_index <=> $b_index;
        }
        return $b["score"] <=> $a["score"];
    });

    return $results;
}

function get_blend_summary($primary, $secondary)
{
    if (!$primary || !$secondary) {
        return "";
    }

    $map = [
        "Pioneer-Harmonizer" => "You are a visionary connector. You dream big, initiate possibilities, and still care deeply about how those ideas affect people.",
        "Pioneer-Analyzer" => "You are a strategic innovator. You enjoy bold ideas, but you also want those ideas to make sense and hold up under pressure.",
        "Pioneer-Stabilizer" => "You are a builder. You can imagine a better future while still respecting what it takes to make things real and sustainable.",
        "Pioneer-Energizer" => "You are a catalyst. You bring vision, boldness, and visible momentum that can energize an entire room.",
        "Harmonizer-Analyzer" => "You are a thoughtful empath. You balance emotional intelligence with careful reasoning and often help groups make wise people-centered decisions.",
        "Harmonizer-Stabilizer" => "You are a dependable encourager. You create environments that feel safe, steady, respectful, and trustworthy.",
        "Harmonizer-Energizer" => "You are a warm motivator. You naturally lift others up and help people feel included, energized, and emotionally connected.",
        "Analyzer-Stabilizer" => "You are a careful planner. You value precision, reliability, and systems that help ideas become dependable results.",
        "Analyzer-Energizer" => "You are a persuasive thinker. You can take complex ideas and give them direction, clarity, and visible momentum.",
        "Stabilizer-Energizer" => "You are a practical motivator. You help teams move forward while protecting structure, accountability, and follow-through.",
    ];

    $a = $primary["name"] . "-" . $secondary["name"];
    $b = $secondary["name"] . "-" . $primary["name"];

    if (isset($map[$a])) {
        return $map[$a];
    }
    if (isset($map[$b])) {
        return $map[$b];
    }

    return "You blend " . $primary["name"] . " and " . $secondary["name"] . ", which means you bring both " . strtolower($primary["short"]) . " and " . strtolower($secondary["short"]) . " energy to the people around you.";
}

function get_compliment_message($primary, $results)
{
    if (!$primary || empty($results)) {
        return "";
    }

    $lower = array_slice($results, 3);
    $names = [];
    foreach ($lower as $item) {
        $names[] = $item["name"];
    }

    if (empty($names)) {
        return "";
    }

    return "Your lower-scoring types are not weaknesses to be ashamed of. They usually show where you may naturally need support, partnership, or intentional growth. " . $primary["name"] . "s often benefit from people who bring " . implode(" and ", $names) . " energy so the whole team becomes stronger and more balanced.";
}
$step = "contact"; // contact | choose_version | quiz | results
$errors = [];

$name = "";
$email = "";
$phone = "";
$version = "";
$answers = [];
$results = [];
$primary = null;
$secondary = null;
$percentage = 0;
$total_count = 0;
$same_type_count = 0;

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $action = $_POST["action"] ?? "";

    if ($action === "choose_version") {
        $name = clean_text($_POST["name"] ?? "");
        $email = clean_text($_POST["email"] ?? "");
        $phone = clean_text($_POST["phone"] ?? "");

        if ($name === "" || $email === "") {
            $errors[] = "Name and email are required before starting the quiz.";
            $step = "contact";
        } else {
            $step = "choose_version";
        }
    }

    if ($action === "start_quiz") {
        $name = clean_text($_POST["name"] ?? "");
        $email = clean_text($_POST["email"] ?? "");
        $phone = clean_text($_POST["phone"] ?? "");
        $version = clean_text($_POST["version"] ?? "");

        if ($name === "" || $email === "") {
            $errors[] = "Name and email are required.";
            $step = "contact";
        } elseif (!isset($question_sets[$version])) {
            $errors[] = "Please choose a version before starting the quiz.";
            $step = "choose_version";
        } else {
            $step = "quiz";
        }
    }

    if ($action === "submit_quiz") {
        $name = clean_text($_POST["name"] ?? "");
        $email = clean_text($_POST["email"] ?? "");
        $phone = clean_text($_POST["phone"] ?? "");
        $version = clean_text($_POST["version"] ?? "");

        if ($name === "" || $email === "") {
            $errors[] = "Name and email are required.";
        }

        if (!isset($question_sets[$version])) {
            $errors[] = "Please choose a valid version.";
        }

        if (isset($question_sets[$version])) {
            $active_questions = $question_sets[$version]["questions"];
            foreach ($active_questions as $question) {
                $key = "q" . $question["id"];
                if (!isset($_POST[$key]) || $_POST[$key] === "") {
                    $errors[] = "Please answer question " . $question["id"] . ".";
                } else {
                    $value = (int)$_POST[$key];
                    if ($value < 1 || $value > 5) {
                        $errors[] = "Question " . $question["id"] . " must be between 1 and 5.";
                    } else {
                        $answers[$question["id"]] = $value;
                    }
                }
            }
        }

        if (!empty($errors)) {
            $step = isset($question_sets[$version]) ? "quiz" : "choose_version";
        } else {
            $results = build_results($answers, $question_sets[$version]["questions"], $types, $priority);
            $primary = $results[0] ?? null;
            $secondary = $results[1] ?? null;

            $pioneer_score = 0;
            $harmonizer_score = 0;
            $analyzer_score = 0;
            $stabilizer_score = 0;
            $energizer_score = 0;

            foreach ($results as $res) {
                if ($res["key"] === "pioneer") {
                    $pioneer_score = $res["score"];
                }
                if ($res["key"] === "harmonizer") {
                    $harmonizer_score = $res["score"];
                }
                if ($res["key"] === "analyzer") {
                    $analyzer_score = $res["score"];
                }
                if ($res["key"] === "stabilizer") {
                    $stabilizer_score = $res["score"];
                }
                if ($res["key"] === "energizer") {
                    $energizer_score = $res["score"];
                }
            }

            $primary_type = $primary ? $primary["key"] : "";

            $sql = "INSERT INTO results
                (name, email, phone, pioneer_score, harmonizer_score, analyzer_score, stabilizer_score, energizer_score, primary_type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                $errors[] = "Database prepare failed: " . $conn->error;
                $step = "quiz";
            } else {
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
                    $errors[] = "Database insert failed: " . $stmt->error;
                    $step = "quiz";
                } else {
                    $total_result = $conn->query("SELECT COUNT(*) AS total_count FROM results");
                    $total_row = $total_result ? $total_result->fetch_assoc() : null;
                    $total_count = $total_row ? (int)$total_row["total_count"] : 0;

                    if ($primary_type !== "") {
                        $stmt2 = $conn->prepare("SELECT COUNT(*) AS same_count FROM results WHERE primary_type = ?");
                        if ($stmt2) {
                            $stmt2->bind_param("s", $primary_type);
                            $stmt2->execute();
                            $same_result = $stmt2->get_result();
                            $same_row = $same_result->fetch_assoc();
                            $same_type_count = (int)$same_row["same_count"];
                            $stmt2->close();
                        }
                    }

                    if ($total_count > 0) {
                        $percentage = round(($same_type_count / $total_count) * 100);
                    }

                    $step = "results";
                }

                $stmt->close();
            }
        }
    }
}
?>
<!doctype html>
<!--
Author: Jeffrey Jenson
Last Updated: 3/24/2026

Project: Final Website Project
Description: PHASE quiz lead-capture page (single-page flow).
-->
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PHASE Quiz | James Thelin</title>
    <link rel="stylesheet" href="style.css" />
    <script src="script.js" defer></script>
  </head>
  <body>
    <header class="navbar">
      <div class="container nav-inner">
        <a class="brand" href="index.html">JAMES THELIN | ENTREPRENEUR | KEYNOTE SPEAKER | AUTHOR</a>
        <nav class="nav-links">
          <a href="index.html">Home</a>
          <a href="phase.php">PHASE + Quiz</a>
          <a href="blog.html">Blog</a>
          <a href="contact.php">Book / Contact</a>
        </nav>
      </div>
    </header>

    <main>
      <section class="section">
        <div class="container">
          <h2>PHASE Personality Test</h2>
          <p class="mini">
            Start with your contact info, choose a version, then complete the quiz. Results appear instantly
            and are stored in the database for the assignment.
          </p>

          <?php if (!empty($errors)): ?>
            <div class="card" style="margin-bottom: 18px">
              <p class="mini"><strong>Please fix the following:</strong></p>
              <ul class="mini">
                <?php foreach ($errors as $error): ?>
                  <li><?php echo h($error); ?></li>
                <?php endforeach; ?>
              </ul>
            </div>
          <?php endif; ?>

          <div class="split">
            <div class="callout">
              <?php if ($step === "contact"): ?>
                <h3>Step 1: Contact Info</h3>
                <form class="form" action="contact.php" method="post">
                  <input type="hidden" name="action" value="choose_version" />

                  <label>
                    Your Name
                    <input type="text" name="name" value="<?php echo h($name); ?>" required />
                  </label>

                  <label>
                    Email
                    <input type="email" name="email" value="<?php echo h($email); ?>" required />
                  </label>

                  <label>
                    Phone
                    <input type="text" name="phone" value="<?php echo h($phone); ?>" />
                  </label>

                  <button class="btn btn-primary" type="submit">Continue</button>
                </form>

              <?php elseif ($step === "choose_version"): ?>
                <h3>Step 2: Choose a Version</h3>
                <p class="mini">Select the version that fits the person taking the test.</p>

                <?php foreach ($question_sets as $set): ?>
                  <form class="card" style="margin-bottom: 12px" action="contact.php" method="post">
                    <input type="hidden" name="action" value="start_quiz" />
                    <input type="hidden" name="name" value="<?php echo h($name); ?>" />
                    <input type="hidden" name="email" value="<?php echo h($email); ?>" />
                    <input type="hidden" name="phone" value="<?php echo h($phone); ?>" />
                    <input type="hidden" name="version" value="<?php echo h($set["key"]); ?>" />

                    <h4 style="margin: 0 0 6px"><?php echo h($set["label"]); ?></h4>
                    <p class="mini" style="margin: 0 0 10px"><?php echo h($set["description"]); ?></p>
                    <button class="btn btn-primary" type="submit">Start <?php echo h($set["label"]); ?></button>
                  </form>
                <?php endforeach; ?>

              <?php elseif ($step === "quiz"): ?>
                <h3>Step 3: Quiz Questions</h3>
                <p class="mini" style="margin-bottom: 10px">
                  Version: <?php echo h($question_sets[$version]["label"]); ?>
                </p>
                <p class="mini" style="margin-bottom: 12px">
                  1 = Strongly Disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly Agree
                </p>

                <form class="form" action="contact.php" method="post">
                  <input type="hidden" name="action" value="submit_quiz" />
                  <input type="hidden" name="name" value="<?php echo h($name); ?>" />
                  <input type="hidden" name="email" value="<?php echo h($email); ?>" />
                  <input type="hidden" name="phone" value="<?php echo h($phone); ?>" />
                  <input type="hidden" name="version" value="<?php echo h($version); ?>" />

                  <?php foreach ($question_sets[$version]["questions"] as $question): ?>
                    <div class="q">
                      <strong><?php echo h($question["id"]); ?>) <?php echo h($question["text"]); ?></strong>
                      <?php foreach ($scale as $value => $label): ?>
                        <?php
                          $required = ($value === 1) ? "required" : "";
                          $checked = (isset($answers[$question["id"]]) && $answers[$question["id"]] === $value) ? "checked" : "";
                        ?>
                        <label>
                          <input
                            type="radio"
                            name="q<?php echo h($question["id"]); ?>"
                            value="<?php echo h($value); ?>"
                            <?php echo $required; ?>
                            <?php echo $checked; ?>
                          />
                          <?php echo h($value); ?> - <?php echo h($label); ?>
                        </label>
                      <?php endforeach; ?>
                    </div>
                  <?php endforeach; ?>

                  <button class="btn btn-primary" type="submit">Submit My Quiz</button>
                </form>

              <?php else: ?>
                <h3>Your Results</h3>
                <?php if ($primary): ?>
                  <p><strong>Name:</strong> <?php echo h($name); ?></p>
                  <p><strong>Email:</strong> <?php echo h($email); ?></p>
                  <p><strong>Phone:</strong> <?php echo h($phone); ?></p>
                  <p><strong>Version:</strong> <?php echo h($question_sets[$version]["label"]); ?></p>
                  <hr class="sep" />

                  <div class="card" style="margin-bottom: 12px">
                    <h4 style="margin: 0 0 6px">Primary: <?php echo h($primary["name"]); ?></h4>
                    <p class="mini" style="margin: 0 0 6px"><?php echo h($primary["short"]); ?></p>
                    <p class="mini" style="margin: 0">Color: <?php echo h($primary["colorName"]); ?> | Archetype: <?php echo h($primary["archetype"]); ?></p>
                  </div>

                  <?php if ($secondary): ?>
                    <div class="card" style="margin-bottom: 12px">
                      <h4 style="margin: 0 0 6px">Secondary: <?php echo h($secondary["name"]); ?></h4>
                      <p class="mini" style="margin: 0 0 6px"><?php echo h($secondary["short"]); ?></p>
                      <p class="mini" style="margin: 0">Color: <?php echo h($secondary["colorName"]); ?> | Archetype: <?php echo h($secondary["archetype"]); ?></p>
                    </div>
                  <?php endif; ?>

                  <div class="card" style="margin-bottom: 12px">
                    <p class="mini">
                      You are <?php echo h($primary["name"]); ?>, which is
                      <?php echo h($percentage); ?>% of all people who have taken this quiz.
                    </p>
                    <p class="mini">Total quiz takers: <?php echo h($total_count); ?></p>
                  </div>

                  <div class="card" style="margin-bottom: 12px">
                    <h4 style="margin: 0 0 6px">Your Blend</h4>
                    <p class="mini" style="margin: 0 0 6px"><?php echo h(get_blend_summary($primary, $secondary)); ?></p>
                    <p class="mini" style="margin: 0"><?php echo h(get_compliment_message($primary, $results)); ?></p>
                  </div>

                  <div class="card" style="margin-bottom: 12px">
                    <h4 style="margin: 0 0 6px">Scoreboard</h4>
                    <?php foreach ($results as $res): ?>
                      <p class="mini" style="margin: 0 0 6px">
                        <?php echo h($res["name"]); ?>: <?php echo h($res["score"]); ?> points (<?php echo h($res["percent"]); ?>%)
                      </p>
                    <?php endforeach; ?>
                  </div>

                  <div class="card" style="margin-bottom: 12px">
                    <h4 style="margin: 0 0 6px">Primary Strengths</h4>
                    <ul class="mini">
                      <?php foreach ($primary["deepStrengths"] as $item): ?>
                        <li><?php echo h($item); ?></li>
                      <?php endforeach; ?>
                    </ul>
                    <h4 style="margin: 12px 0 6px">Primary Watchouts</h4>
                    <ul class="mini">
                      <?php foreach ($primary["deepWatchouts"] as $item): ?>
                        <li><?php echo h($item); ?></li>
                      <?php endforeach; ?>
                    </ul>
                  </div>

                  <div class="card" style="margin-bottom: 12px">
                    <h4 style="margin: 0 0 6px">How to Work With You</h4>
                    <p class="mini" style="margin: 0 0 6px"><?php echo h($primary["teamwork"]); ?></p>
                    <p class="mini" style="margin: 0">Science parallels: <?php echo h($primary["science"]); ?></p>
                  </div>

                  <div class="card" style="margin-bottom: 12px">
                    <h4 style="margin: 0 0 6px">Ideal Partners</h4>
                    <ul class="mini">
                      <?php foreach ($primary["idealPartners"] as $item): ?>
                        <li><?php echo h($item); ?></li>
                      <?php endforeach; ?>
                    </ul>
                  </div>

                  <div class="card" style="margin-top: 18px">
                    <h3>Admin Tools (Class Demo)</h3>
                    <p class="mini">
                      <a href="search.php">Search Results</a> |
                      <a href="update.php">Update a Record</a>
                    </p>
                  </div>
                <?php endif; ?>
              <?php endif; ?>
            </div>
            <div>
              <div class="card">
                <img
                  class="speaker-img"
                  src="images/IMG_0141.jpg"
                  alt="James Thelin speaking"
                />
              </div>

              <div class="card">
                <h3>What the quiz measures</h3>
                <ul class="mini">
                  <li>How you respond under pressure</li>
                  <li>How you make decisions</li>
                  <li>How you support and energize others</li>
                  <li>How you stay steady and consistent</li>
                </ul>
              </div>

              <div class="card" style="margin-top: 18px">
                <h3>Quick Insight</h3>
                <p id="quote" class="mini">Attention is power. Protect it.</p>
                <button class="btn btn-primary" onclick="newQuote()">
                  Next Insight
                </button>
              </div>
            </div>
          </div>

          <hr class="sep" />

          <h2>FAQ</h2>
          <p class="mini">Click a question to expand.</p>

          <div class="card">
            <h3 style="cursor: pointer" onclick="toggleFaq('faq1')">
              Is this a diagnosis or therapy?
            </h3>
            <p class="mini" id="faq1" style="display: none">
              No. This is educational content designed to help people understand
              patterns and build better habits.
            </p>
          </div>

          <div class="card" style="margin-top: 12px">
            <h3 style="cursor: pointer" onclick="toggleFaq('faq2')">
              Do you cover AI and cheating?
            </h3>
            <p class="mini" id="faq2" style="display: none">
              Yes. The program teaches learning-first AI use and clear
              guardrails. You own the outcome.
            </p>
          </div>

          <div class="card" style="margin-top: 12px">
            <h3 style="cursor: pointer" onclick="toggleFaq('faq3')">
              Is my data saved?
            </h3>
            <p class="mini" id="faq3" style="display: none">
              For this class demo, quiz results are saved in the database so they
              can be searched and updated.
            </p>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container">
        &copy; <span id="year"></span> James Thelin. Educational content. Not a
        diagnosis.
      </div>
    </footer>

    <script>
      document.getElementById("year").textContent = new Date().getFullYear();
    </script>
  </body>
</html>
