<?php

$name = trim($_POST['name']);
$email = trim($_POST['email']);
$feedback = trim($_POST['feedback']);

echo "<h1>Feedback received</h1>";

echo "<p>Thank you, <strong>$name</strong>.</p>";

echo "<p>Your email: $email</p>";

echo "<p>Your feedback:</p>";

echo "<p>$feedback</p>";

?>