<?php
// results.php
// Displays the user's quiz results and comparison statistics.

// Debugging (turn off in production)
error_reporting(E_ALL);
ini_set("display_errors", "1");

require_once "db_connect.php";

function h($value)
{
    return htmlspecialchars($value ?? "", ENT_QUOTES, "UTF-8");
}

$id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;
$error_message = "";
$row = null;
$percentage = 0;
$total_count = 0;
$same_type_count = 0;

if ($id <= 0) {
    $error_message = "Missing or invalid result ID.";
} else {
    $stmt = $conn->prepare("SELECT * FROM results WHERE id = ?");
    if ($stmt) {
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
    }

    if (!$row) {
        $error_message = "Result not found.";
    } else {
        // Total quiz takers
        $total_result = $conn->query("SELECT COUNT(*) AS total_count FROM results");
        $total_row = $total_result ? $total_result->fetch_assoc() : null;
        $total_count = $total_row ? (int)$total_row["total_count"] : 0;

        // Count users with the same primary type
        $stmt2 = $conn->prepare("SELECT COUNT(*) AS same_count FROM results WHERE primary_type = ?");
        if ($stmt2) {
            $stmt2->bind_param("s", $row["primary_type"]);
            $stmt2->execute();
            $same_result = $stmt2->get_result();
            $same_row = $same_result->fetch_assoc();
            $same_type_count = (int)$same_row["same_count"];
            $stmt2->close();
        }

        if ($total_count > 0) {
            $percentage = round(($same_type_count / $total_count) * 100);
        }
    }
}
?>
<!doctype html>
<!--
Author: Jeffrey Jenson
Last Updated: 3/24/2026

Project: Final Website Project
Description: Displays PHASE quiz results with comparison stats.
-->
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PHASE Results | James Thelin</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <header class="navbar">
      <div class="container nav-inner">
        <a class="brand" href="index.html"
          >JAMES THELIN | ENTREPRENEUR | KEYNOTE SPEAKER | AUTHOR</a
        >
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
          <h2>Your PHASE Results</h2>

          <?php if ($error_message !== ""): ?>
            <div class="card">
              <p class="mini"><?php echo h($error_message); ?></p>
            </div>
          <?php else: ?>
            <div class="card">
              <p><strong>Name:</strong> <?php echo h($row["name"]); ?></p>
              <p><strong>Email:</strong> <?php echo h($row["email"]); ?></p>
              <p><strong>Phone:</strong> <?php echo h($row["phone"]); ?></p>
              <hr class="sep" />
              <p><strong>Pioneer Score:</strong> <?php echo h($row["pioneer_score"]); ?></p>
              <p><strong>Harmonizer Score:</strong> <?php echo h($row["harmonizer_score"]); ?></p>
              <p><strong>Analyzer Score:</strong> <?php echo h($row["analyzer_score"]); ?></p>
              <p><strong>Stabilizer Score:</strong> <?php echo h($row["stabilizer_score"]); ?></p>
              <p><strong>Energizer Score:</strong> <?php echo h($row["energizer_score"]); ?></p>
              <p><strong>Primary Type:</strong> <?php echo h($row["primary_type"]); ?></p>
            </div>

            <div class="card" style="margin-top: 18px">
              <p class="mini">
                You are <?php echo h($row["primary_type"]); ?>, which is
                <?php echo h($percentage); ?>% of all people who have taken this quiz.
              </p>
              <p class="mini">
                Total quiz takers: <?php echo h($total_count); ?>
              </p>
            </div>

            <div class="card" style="margin-top: 18px">
              <h3>Admin Tools (Class Demo)</h3>
              <p class="mini">
                <a href="search.php">Search Results</a> |
                <a href="update.php">Update a Record</a>
              </p>
            </div>
          <?php endif; ?>
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
