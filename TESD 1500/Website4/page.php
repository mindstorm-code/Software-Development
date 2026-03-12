```php
<?php

class Page
{
    var $content;

    function Display()
    {
        echo "<!DOCTYPE html>";
        echo "<html>";
        echo "<head>";
        echo "<title>My Website</title>";
        echo "<link rel='stylesheet' href='styles.css'>";
        echo "</head>";
        echo "<body>";

        $this->DisplayHeader();
        echo $this->content;
        $this->DisplayFooter();

        echo "</body>";
        echo "</html>";
    }

    function DisplayHeader()
    {
        echo "<header>";
        echo "<h1>My Website</h1>";
        echo "<nav>";
        echo "<a href='home.php'>Home</a> | ";
        echo "<a href='services.php'>Services</a> | ";
        echo "<a href='contact.php'>Contact</a>";
        echo "</nav>";
        echo "</header>";
    }

    function DisplayFooter()
    {
        echo "<footer>";
        echo "<p>© " . date("Y") . " My Website</p>";
        echo "</footer>";
    }
}

?>
```
