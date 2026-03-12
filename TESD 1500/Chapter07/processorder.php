<?php

require_once("file_exceptions.php");

$tireqty = (int)$_POST['tireqty'];
$oilqty = (int)$_POST['oilqty'];
$sparkqty = (int)$_POST['sparkqty'];
$address = $_POST['address'];

$document_root = $_SERVER['DOCUMENT_ROOT'];
$date = date('H:i, jS F Y');

?>
<!DOCTYPE html>
<html>
<head>
<title>Bob's Auto Parts - Order Results</title>
</head>

<body>

<h1>Bob's Auto Parts</h1>
<h2>Order Results</h2>

<?php

echo "<p>Order processed at ".$date."</p>";

$totalqty = $tireqty + $oilqty + $sparkqty;

define('TIREPRICE',100);
define('OILPRICE',10);
define('SPARKPRICE',4);

$totalamount = $tireqty*TIREPRICE +
               $oilqty*OILPRICE +
               $sparkqty*SPARKPRICE;

$taxrate = 0.10;
$totalamount = $totalamount*(1+$taxrate);

echo "<p>Total items ordered: ".$totalqty."</p>";
echo "<p>Total amount: $".number_format($totalamount,2)."</p>";
echo "<p>Shipping to: ".htmlspecialchars($address)."</p>";

$outputstring = $date."\t".$tireqty." tires\t".$oilqty." oil\t".
                $sparkqty." spark plugs\t$".$totalamount."\t".$address."\n";

try {

    if (!($fp = @fopen("$document_root/../orders/orders.txt",'ab'))) {
        throw new fileOpenException();
    }

    if (!flock($fp,LOCK_EX)) {
        throw new fileLockException();
    }

    if (!fwrite($fp,$outputstring)) {
        throw new fileWriteException();
    }

    flock($fp,LOCK_UN);
    fclose($fp);

    echo "<p>Order written.</p>";

}
catch (fileOpenException $foe) {

    echo "<p><strong>Orders file could not be opened.</strong></p>";

}
catch (Exception $e) {

    echo "<p><strong>Your order could not be processed.</strong></p>";

}

?>

</body>
</html>