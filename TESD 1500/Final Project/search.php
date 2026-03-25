<?php
// search.php
// Search and display quiz results (assignment requirement).

// Debugging (turn off in production)
error_reporting(E_ALL);
ini_set("display_errors", "1");

require_once "db_connect.php";

function h($value)
{
    return htmlspecialchars($value ?? "", ENT_QUOTES, "UTF-8");
}

$name = trim($_GET["name"] ?? "");
$email = trim($_GET["email"] ?? "");
$primary_type = trim($_GET["primary_type"] ?? "");
$searched = ($name !== "" || $email !== "" || $primary_type !== "");

$rows = [];
if ($searched) {
    $sql = "SELECT id, name, email, phone, primary_type, created_at FROM results";
    $where = [];
    $params = [];
    $types = "";

    if ($name !== "") {
        $where[] = "name LIKE ?";
        $params[] = "%" . $name . "%";
        $types .= "s";
    }

    if ($email !== "") {
        $where[] = "email LIKE ?";
        $params[] = "%" . $email . "%";
        $types .= "s";
    }

    if ($primary_type !== "") {
        $where[] = "primary_type LIKE ?";
        $params[] = "%" . $primary_type . "%";
        $types .= "s";
    }

    if (!empty($where)) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }

    $stmt = $conn->prepare($sql);
    if ($stmt) {
        if (!empty($params)) {
            // bind_param needs references, so we build an array of references
            $bind_values = [];
            $bind_values[] = $types;
            foreach ($params as $key => $value) {
                $bind_values[] = &$params[$key];
            }
            call_user_func_array([$stmt, "bind_param"], $bind_values);
        }

        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
        $stmt->close();
    }
}
?>
<!doctype html>
<!--
Author: Jeffrey Jenson
Last Updated: 3/24/2026

Project: Final Website Project
Description: Search page for PHASE quiz results (assignment requirement).
-->
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Search Results | James Thelin</title>
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
          <h2>Search Quiz Results</h2>
          <p class="mini">
            Search by name, email, or primary type. You can use one field or multiple.
          </p>

          <div class="card">
            <form class="form" action="search.php" method="get">
              <label>
                Name
                <input type="text" name="name" value="<?php echo h($name); ?>" />
              </label>

              <label>
                Email
                <input type="text" name="email" value="<?php echo h($email); ?>" />
              </label>

              <label>
                Primary Type
                <input
                  type="text"
                  name="primary_type"
                  value="<?php echo h($primary_type); ?>"
                  placeholder="pioneer"
                />
              </label>

              <button class="btn btn-primary" type="submit">Search</button>
            </form>
          </div>

          <?php if ($searched): ?>
            <div class="card" style="margin-top: 18px">
              <?php if (empty($rows)): ?>
                <p class="mini">No matching records found.</p>
              <?php else: ?>
                <table style="width: 100%; border-collapse: collapse">
                  <thead>
                    <tr>
                      <th style="text-align: left; padding: 8px">ID</th>
                      <th style="text-align: left; padding: 8px">Name</th>
                      <th style="text-align: left; padding: 8px">Email</th>
                      <th style="text-align: left; padding: 8px">Phone</th>
                      <th style="text-align: left; padding: 8px">Primary Type</th>
                      <th style="text-align: left; padding: 8px">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    <?php foreach ($rows as $row): ?>
                      <tr>
                        <td style="padding: 8px"><?php echo h($row["id"]); ?></td>
                        <td style="padding: 8px"><?php echo h($row["name"]); ?></td>
                        <td style="padding: 8px"><?php echo h($row["email"]); ?></td>
                        <td style="padding: 8px"><?php echo h($row["phone"]); ?></td>
                        <td style="padding: 8px"><?php echo h($row["primary_type"]); ?></td>
                        <td style="padding: 8px"><?php echo h($row["created_at"]); ?></td>
                      </tr>
                    <?php endforeach; ?>
                  </tbody>
                </table>
              <?php endif; ?>
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
