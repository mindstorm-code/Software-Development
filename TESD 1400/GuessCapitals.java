/*
Exercise 8-37
Date: 9/8/2025
Student: Jeffrey Jenson 
Course: TESD 1400 — Computer Programming
Description: Guess the capital for 10 states. Program checks answers (case-insensitive)
and displays the total correct count.
*/

import java.util.Scanner;

public class GuessCapitals {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        // 2D array: {state, capital}
        String[][] statesAndCapitals = {
            {"Utah", "Salt Lake City"},
            {"Idaho", "Boise"},
            {"Nevada", "Carson City"},
            {"Arizona", "Phoenix"},
            {"California", "Sacramento"},
            {"Oregon", "Salem"},
            {"Colorado", "Denver"},
            {"Texas", "Austin"},
            {"Florida", "Tallahassee"},
            {"New York", "Albany"}
        };

        int correctCount = 0;

        // Loop through each state
        for (int i = 0; i < statesAndCapitals.length; i++) {
            System.out.print("What is the capital of " + statesAndCapitals[i][0] + "? ");
            String answer = input.nextLine().trim();

            // Compare case-insensitive
            if (answer.equalsIgnoreCase(statesAndCapitals[i][1])) {
                System.out.println("Correct!");
                correctCount++;
            } else {
                System.out.println("Wrong. The correct answer is " + statesAndCapitals[i][1] + ".");
            }
        }

        // Final score
        System.out.println("You got " + correctCount + " out of " + statesAndCapitals.length + " correct.");
    }
}
