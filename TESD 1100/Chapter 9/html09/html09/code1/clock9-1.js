"use strict";

/*
   New Perspectives on HTML5 and CSS3, 8th Edition
   Tutorial 9
   Coding Challenge 1

   Clock
   Author: Jeffrey Jenson
   Date:   2026-01-21

   function getWeekday(dayNum)
      Returns the text of the day of the week where dayNum
      is the number of the week from 0 (Sunday) to 6 (Saturday)
*/

function getWeekday(dayNum) {
  var wDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return wDays[dayNum];
}

/* Run the clock once, then update it every second */
runClock();
setInterval(runClock, 1000);

function runClock() {
  // a. Current date/time
  var thisDay = new Date();

  // b. Date string
  var thisDate = thisDay.toLocaleDateString();

  // c. Weekday number (0-6)
  var thisDayNum = thisDay.getDay();

  // d. Weekday name
  var thisWeekday = getWeekday(thisDayNum);

  // e. Time string
  var thisTime = thisDay.toLocaleTimeString();

  // f. Write values to the page
  document.getElementById("date").textContent = thisDate;
  document.getElementById("wday").textContent = thisWeekday;
  document.getElementById("time").textContent = thisTime;
}
