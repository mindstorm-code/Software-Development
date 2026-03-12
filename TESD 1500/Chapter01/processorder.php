<!DOCTYPE html>
<html>
<head>
  <title>Bob's Auto Parts - Order Results</title>
</head>
<body>

<h1>Bob's Auto Parts</h1>
<h2>Order Results</h2>

<?php

// Safely get form data
$tireqty  = isset($_POST['tireqty'])  ? (int)$_POST['tireqty']  : 0;
$oilqty   = isset($_POST['oilqty'])   ? (int)$_POST['oilqty']   : 0;
$sparkqty = isset($_POST['sparkqty']) ? (int)$_POST['sparkqty'] : 0;

// Prices
define("TIREPRICE", 100);
define("OILPRICE", 10);
define("SPARKPRICE", 4);

// Calculate totals
$totalqty = $tireqty + $oilqty + $sparkqty;

$totalamount = ($tireqty * TIREPRICE)
             + ($oilqty * OILPRICE)
             + ($sparkqty * SPARKPRICE);

// Output
echo "<p>Order processed at " . date('H:i, jS F Y') . "</p>";
echo "<p>Total items ordered: " . $totalqty . "</p>";

if ($totalqty == 0) {
    echo "<p>You did not order anything.</p>";
} else {

    echo "<p>Total amount: $" . number_format($totalamount, 2) . "</p>";

    $taxrate = 0.08;
    $totalWithTax = $totalamount * (1 + $taxrate);

    echo "<p>Total including tax: $" . number_format($totalWithTax, 2) . "</p>";
}

?>

</body>
</html>