<?php

$name = trim($_POST['name']);
$email = trim($_POST['email']);
$feedback = trim($_POST['feedback']);

$date = date("Y-m-d H:i:s");

$output = $date."\t".$name."\t".$email."\t".$feedback."\n";

$file = fopen("feedback.txt", "a");

fwrite($file, $output);

fclose($file);

echo "<h2>Thank you for your feedback!</h2>";

echo "<a href='feedback.html'>Submit Another</a>";

?>