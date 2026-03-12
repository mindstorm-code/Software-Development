<?php

require_once "exceptions.php";

$tireqty = (int)$_POST['tireqty'];
$oilqty = (int)$_POST['oilqty'];
$sparkqty = (int)$_POST['sparkqty'];
$address = $_POST['address'];

$totalqty = $tireqty + $oilqty + $sparkqty;

$date = date("Y-m-d H:i:s");

$output = $date."\t".$tireqty."\t".$oilqty."\t".$sparkqty."\t".$address."\n";

echo "<h1>Order Results</h1>";

try {

    if($totalqty == 0){
        throw new Exception("You must order at least one item.");
    }

    if(!($fp = fopen("orders.txt","a"))){
        throw new fileOpenException("Could not open orders file.");
    }

    if(!flock($fp,LOCK_EX)){
        throw new fileLockException("Could not lock orders file.");
    }

    if(!fwrite($fp,$output)){
        throw new fileWriteException("Could not write order.");
    }

    flock($fp,LOCK_UN);
    fclose($fp);

    echo "<p>Order successfully processed.</p>";

}

catch(fileOpenException $e){
    echo "<p>File open error: ".$e->getMessage()."</p>";
}

catch(fileLockException $e){
    echo "<p>File lock error: ".$e->getMessage()."</p>";
}

catch(fileWriteException $e){
    echo "<p>File write error: ".$e->getMessage()."</p>";
}

catch(Exception $e){
    echo "<p>Error: ".$e->getMessage()."</p>";
}

?>
