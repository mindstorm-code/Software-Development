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

  for ($i = 0; $i < $number_of_orders; $i++) {
    echo htmlspecialchars($orders[$i]) . "<br />";
  }

}

?>

</body>
</html>