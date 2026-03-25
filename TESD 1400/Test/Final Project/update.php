<?php
// update.php
// Update existing quiz records (assignment requirement).

// Debugging (turn off in production)
error_reporting(E_ALL);
ini_set("display_errors", "1");

require_once "db_connect.php";

function h($value)
{
    return htmlspecialchars($value ?? "", ENT_QUOTES, "UTF-8");
}

$message = "";
$error = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $lookup_id = trim($_POST["lookup_id"] ?? "");
    $lookup_email = trim($_POST["lookup_email"] ?? "");

    $name = trim($_POST["name"] ?? "");
    $email = trim($_POST["email"] ?? "");
    $phone = trim($_POST["phone"] ?? "");
    $primary_type = trim($_POST["primary_type"] ?? "");
    $pioneer_score = trim($_POST["pioneer_score"] ?? "");

    if ($lookup_id === "" && $lookup_email === "") {
        $error = "Please provide a record ID or lookup email.";
    } else {
        $fields = [];
        $params = [];
        $types = "";

        if ($name !== "") {
            $fields[] = "name = ?";
            $params[] = $name;
            $types .= "s";
        }

        if ($email !== "") {
            $fields[] = "email = ?";
            $params[] = $email;
            $types .= "s";
        }

        if ($phone !== "") {
            $fields[] = "phone = ?";
            $params[] = $phone;
            $types .= "s";
        }

        if ($primary_type !== "") {
            $fields[] = "primary_type = ?";
            $params[] = $primary_type;
            $types .= "s";
        }

        if ($pioneer_score !== "") {
            $fields[] = "pioneer_score = ?";
            $params[] = (int)$pioneer_score;
            $types .= "i";
        }

        if (empty($fields)) {
            $error = "Please enter at least one field to update.";
        } else {
            // Use ID if provided, otherwise use lookup email
            if ($lookup_id !== "") {
                $where_sql = "id = ?";
                $params[] = (int)$lookup_id;
                $types .= "i";
            } else {
                $where_sql = "email = ?";
                $params[] = $lookup_email;
                $types .= "s";
            }

            $sql = "UPDATE results SET " . implode(", ", $fields) . " WHERE " . $where_sql;
            $stmt = $conn->prepare($sql);

            if ($stmt) {
                // bind_param needs references, so we build an array of references
                $bind_values = [];
                $bind_values[] = $types;
                foreach ($params as $key => $value) {
                    $bind_values[] = &$params[$key];
                }
                call_user_func_array([$stmt, "bind_param"], $bind_values);

                if ($stmt->execute()) {
                    $message = "Update completed. Rows affected: " . $stmt->affected_rows;
                } else {
                    $error = "Update failed: " . $stmt->error;
                }
                $stmt->close();
            } else {
                $error = "Database prepare failed: " . $conn->error;
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
Description: Update page for PHASE quiz records (assignment requirement).
-->
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Update Results | James Thelin</title>
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
          <h2>Update a Quiz Record</h2>
          <p class="mini">
            Update by record ID or lookup email. Fill in only the fields you want to change.
          </p>

          <div class="card">
            <?php if ($message !== ""): ?>
              <p class="mini"><?php echo h($message); ?></p>
            <?php endif; ?>

            <?php if ($error !== ""): ?>
              <p class="mini"><?php echo h($error); ?></p>
            <?php endif; ?>

            <form class="form" action="update.php" method="post">
              <label>
                Record ID (preferred)
                <input type="number" name="lookup_id" min="1" />
              </label>

              <label>
                OR Lookup Email
                <input type="email" name="lookup_email" />
              </label>

              <hr class="sep" />

              <label>
                New Name
                <input type="text" name="name" />
              </label>

              <label>
                New Email
                <input type="email" name="email" />
              </label>

              <label>
                New Phone
                <input type="text" name="phone" />
              </label>

              <label>
                New Primary Type
                <input type="text" name="primary_type" placeholder="pioneer" />
              </label>

              <label>
                New Pioneer Score (example score field)
                <input type="number" name="pioneer_score" min="0" />
              </label>

              <button class="btn btn-primary" type="submit">Update Record</button>
            </form>
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
