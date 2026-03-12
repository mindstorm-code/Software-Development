<?php
// =========================
// PROCESS LOGIC FIRST
// =========================

// Get form data safely
$tireqty  = isset($_POST['tireqty']) ? (int)$_POST['tireqty'] : 0;
$oilqty   = isset($_POST['oilqty']) ? (int)$_POST['oilqty'] : 0;
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

$date = date('H:i, jS F Y');

// Prepare output string for file
$outputstring = $date . "\t"
              . $tireqty . " tires\t"
              . $oilqty . " oil\t"
              . $sparkqty . " spark plugs\t"
              . "$" . number_format($totalamount, 2) . "\n";

// Write to file ONLY if something ordered
if ($totalqty > 0) {

    $fp = fopen("orders.txt", "a");

    if ($fp) {
        flock($fp, LOCK_EX);
        fwrite($fp, $outputstring);
        flock($fp, LOCK_UN);
        fclose($fp);
        $filesaved = true;
    } else {
        $filesaved = false;
    }

} else {
    $filesaved = false;
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Bob's Auto Parts - Order Results</title>
</head>
<body>

<h1>Bob's Auto Parts</h1>
<h2>Order Results</h2>

<p>Order processed at <?= $date ?></p>
<p>Total items ordered: <?= $totalqty ?></p>

<?php if ($totalqty == 0): ?>

    <p>You did not order anything.</p>

<?php else: ?>

    <p>Total amount: $<?= number_format($totalamount, 2) ?></p>

    <?php if ($filesaved): ?>
        <p>Order saved successfully.</p>
    <?php else: ?>
        <p><strong>Order could not be saved.</strong></p>
    <?php endif; ?>

<?php endif; ?>

<hr>

<h2>Order History</h2>

<?php
if (file_exists("orders.txt")) {
    $fp = fopen("orders.txt", "r");
    while (!feof($fp)) {
        $line = fgets($fp);
        echo htmlspecialchars($line) . "<br>";
    }
    fclose($fp);
} else {
    echo "<p>No previous orders found.</p>";
}
?>

</body>
</html>