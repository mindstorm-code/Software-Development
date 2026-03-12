<?php

$picture = array(
  'brakes',
  'headlight',
  'spark_plug',
  'steering_wheel',
  'tire',
  'wiper_blade'
);

shuffle($picture);

?>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Bob's Auto Parts</title>
</head>

<body>

<h1>Bob's Auto Parts</h1>

<table width="100%">
<tr>

<?php

for ($i = 0; $i < 3; $i++) {
  echo "<td align='center'>";
  echo "<img src='".$picture[$i].".png' alt='Car Part' />";
  echo "</td>";
}

?>

</tr>
</table>

</body>
</html>