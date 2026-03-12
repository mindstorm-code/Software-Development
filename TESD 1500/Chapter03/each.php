<?php
$prices = array(
  'Tires' => 100,
  'Oil' => 10,
  'Spark Plugs' => 4
);

// Loop through the array and display key + value
foreach ($prices as $key => $value) {
  echo $key . " - " . $value . "<br />";
}
?>