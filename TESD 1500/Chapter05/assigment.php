<?php

// Exercise 1: include external file
require('reusable.php');

// Exercise 3: basic function
function my_function() {
    echo "function called<br>";
}

// Exercise 4: function with parameter
function table($data) {
    echo "table created with: $data<br>";
}

// Exercise 2: compute function
function compute($val) {
    echo "Computed result: " . ($val + 10) . "<br>";
}

// Exercise 5: return example
function test_return() {
    echo "This statement will run.<br>";
    
    return; // stops the function
    
    echo "This will never run.";
}

// Run the functions
my_function();
table("Assignment Data");
compute(42);
test_return();

?>