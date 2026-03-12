<?php
$document_root = $_SERVER['DOCUMENT_ROOT'];
$filename = $document_root . "/orders.txt";
?>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Bob's Auto Parts - Customer Orders</title>
</head>

<body>

<h1>Bob's Auto Parts</h1>
<h2>Customer Orders</h2>

<?php

if (!file_exists($filename)) {
  echo "<p>No orders file found.</p>";
}
else {

  $orders = file($filename);
  $number_of_orders = count($orders);

  if ($number_of_orders == 0) {
    echo "<p><strong>No orders pending.</strong></p>";
  }

  echo "<table border='1'>";
  echo "<tr>
        <th>Date</th>
        <th>Tires</th>
        <th>Oil</th>
        <th>Spark Plugs</th>
        </tr>";

  for ($i = 0; $i < $number_of_orders; $i++) {

    $line = explode("\t", $orders[$i]);

    echo "<tr>";
    echo "<td>" . htmlspecialchars($line[0]) . "</td>";
    echo "<td>" . htmlspecialchars($line[1]) . "</td>";
    echo "<td>" . htmlspecialchars($line[2]) . "</td>";
    echo "<td>" . htmlspecialchars($line[3]) . "</td>";
    echo "</tr>";
  }

  echo "</table>";

}

?>

</body>
</html>