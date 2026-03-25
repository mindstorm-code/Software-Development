<?php
// db_connect.php
// Reusable database connection for the PHASE personality quiz.

// Debugging (turn off in production)
error_reporting(E_ALL);
ini_set("display_errors", "1");

// Avoid mysqli throwing exceptions so we can handle errors cleanly
mysqli_report(MYSQLI_REPORT_OFF);

$host = "localhost";
$username = "root";
$password = "root"; // MAMP default password
$database = "phase_test";

// Try common MySQL ports (Windows MAMP often uses 3306; macOS MAMP often uses 8889)
$ports = [3306, 8889];

$conn = null;
$last_error = "";

foreach ($ports as $port) {
    // Suppress connection warnings so failed attempts don't print at the top of the page
    $conn = @new mysqli($host, $username, $password, $database, $port);
    if ($conn && !$conn->connect_error) {
        break;
    }
    $last_error = $conn ? $conn->connect_error : "Connection failed";
}

// Stop the page if the connection fails
if (!$conn || $conn->connect_error) {
    die("DB Error: " . $last_error . " | Tried ports: " . implode(", ", $ports));
}

// Set a safe default charset
$conn->set_charset("utf8mb4");
?>
