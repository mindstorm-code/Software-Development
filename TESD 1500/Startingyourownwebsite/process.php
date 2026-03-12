<!DOCTYPE html>
<html>
<head>
  <title>Form Response</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>

<h1>Thank You!</h1>

</body>
</html>

<?php
$name = isset($_POST['name']) ? $_POST['name'] : "Guest";
$email = isset($_POST['email']) ? $_POST['email'] : "Not provided";
$color = isset($_POST['color']) ? $_POST['color'] : "None";

echo "<p>Name: $name</p>";
echo "<p>Email: $email</p>";
echo "<p>Your favorite color is: $color</p>";

if ($color == "Red") {
    echo "<p>You are bold and energetic!</p>";
} elseif ($color == "Blue") {
    echo "<p>You are calm and thoughtful!</p>";
} else {
    echo "<p>You appreciate balance and growth!</p>";
}
?>
