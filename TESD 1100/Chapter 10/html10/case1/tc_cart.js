"use strict";

/*
   Author: Jeffrey Jenson
   Date: January 26, 2026
   Filename: tc_cart.js
*/

var orderTotal = 0;

var cartHTML =
  "<table><tr>" +
  "<th>Item</th><th>Description</th><th>Price</th><th>Qty</th><th>Total</th>" +
  "</tr>";

for (var i = 0; i < item.length; i++) {
  var itemCost = itemPrice[i] * itemQty[i];

  cartHTML +=
    "<tr>" +
    "<td><img src='tc_" +
    item[i] +
    ".png' alt='item' /></td>" +
    "<td>" +
    itemDescription[i] +
    "</td>" +
    "<td>$" +
    itemPrice[i].toFixed(2) +
    "</td>" +
    "<td>" +
    itemQty[i] +
    "</td>" +
    "<td>$" +
    itemCost.toFixed(2) +
    "</td>" +
    "</tr>";

  orderTotal += itemCost;
}

cartHTML +=
  "<tr><td colspan='4'>Subtotal</td><td>$" +
  orderTotal.toFixed(2) +
  "</td></tr></table>";

document.getElementById("cart").innerHTML = cartHTML;
