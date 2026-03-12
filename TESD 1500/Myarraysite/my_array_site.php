<?php

// 1. Array storing repetitive information
$parts = array(
  "Brake Pads",
  "Headlights",
  "Spark Plugs",
  "Steering Wheel",
  "Tires",
  "Wiper Blades",
  "Oil Filter",
  "Air Filter"
);

// 2. Sort the array
sort($parts);

?>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Jeff's Auto Parts</title>
</head>

<body>

<h1>Jeff's Auto Parts Inventory</h1>

<p>Our parts sorted alphabetically:</p>

<ul>

<?php

// display sorted array
for ($i = 0; $i < count($parts); $i++) {
  echo "<li>" . $parts[$i] . "</li>";
}

?>

</ul>

</body>
</html>