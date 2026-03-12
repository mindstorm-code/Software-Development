<?php
require "functions.php";
?>

<!DOCTYPE html>
<html>

<head>
<link rel="stylesheet" href="styles.css">
<title>My Website</title>
</head>

<body>

<?php include "header.php"; ?>

<section>

<?php
welcomeMessage("Jeffrey");
showDate();
?>

<p>This is my website for the PHP assignment.</p>

</section>

<?php include "footer.php"; ?>

</body>
</html>