<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Search Feedback</title>
</head>

<body>

<h1>Search Customer Feedback</h1>

<form method="post">

Search keyword:<br>
<input type="text" name="keyword">

<input type="submit" value="Search">

</form>

<?php

if (isset($_POST['keyword'])) {

    $keyword = $_POST['keyword'];

    $file = fopen("feedback.txt", "r");

    echo "<h2>Search Results</h2>";

    while (!feof($file)) {

        $line = fgets($file);

        if (preg_match("/$keyword/i", $line)) {
            echo $line . "<br>";
        }

    }

    fclose($file);

}

?>

</body>
</html>