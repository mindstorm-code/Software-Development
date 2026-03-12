
<?php

try {
    throw new Exception("Something went wrong");
}
catch (Exception $e) {
    echo "Caught exception: ".$e->getMessage()."<br />";
}
finally {
    echo "Always runs!";
}

?>

