<?php

$name = trim($_POST['name']);
$email = trim($_POST['email']);
$feedback = trim($_POST['feedback']);

/* remove extra whitespace */
$name = htmlspecialchars($name);
$email = htmlspecialchars($email);
$feedback = htmlspecialchars($feedback);

/* convert new lines to HTML */
$feedback = nl2br($feedback);

/* basic email validation using regex */
if (!preg_match("/^[^@]+@[^@]+\.[a-z]{2,6}$/i", $email)) {
    echo "<h2>Invalid email address.</h2>";
    exit;
}

?>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Feedback Received</title>
</head>

<body>

<h1>Feedback Received</h1>

<p>Thank you <strong><?php echo $name; ?></strong> for your feedback.</p>

<p>Your email address is:</p>

<p><?php echo $email; ?></p>

<p>Your feedback:</p>

<p><?php echo $feedback; ?></p>

</body>
</html>