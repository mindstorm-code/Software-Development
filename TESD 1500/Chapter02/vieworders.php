<?php
// ============================
// READ ORDERS FROM FILE
// ============================

$orders = [];
$filename = "orders.txt";

if (file_exists($filename)) {

    $fp = fopen($filename, "r");

    if ($fp) {

        while (!feof($fp)) {
            $line = trim(fgets($fp));
            if (!empty($line)) {
                $orders[] = $line;
            }
        }

        fclose($fp);
    }

}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Bob's Auto Parts - View Orders</title>
</head>
<body>

<h1>Bob's Auto Parts</h1>
<h2>Order History</h2>

<?php if (empty($orders)): ?>

    <p>No orders have been placed yet.</p>

<?php else: ?>

    <table border="1" cellpadding="5">
        <tr>
            <th>Date</th>
            <th>Tires</th>
            <th>Oil</th>
            <th>Spark Plugs</th>
            <th>Total</th>
        </tr>

        <?php foreach ($orders as $order): ?>

            <?php
                // Split line by tab
                $parts = explode("\t", $order);
            ?>

            <tr>
                <td><?= htmlspecialchars($parts[0] ?? '') ?></td>
                <td><?= htmlspecialchars($parts[1] ?? '') ?></td>
                <td><?= htmlspecialchars($parts[2] ?? '') ?></td>
                <td><?= htmlspecialchars($parts[3] ?? '') ?></td>
                <td><?= htmlspecialchars($parts[4] ?? '') ?></td>
            </tr>

        <?php endforeach; ?>

    </table>

<?php endif; ?>

<p><a href="orderform.html">Back to Order Form</a></p>

</body>
</html>