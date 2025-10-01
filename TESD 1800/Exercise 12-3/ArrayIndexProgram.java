/*
Exercise 12-3: PLanning
Student: Jeffrey Jenson — Stu#6200029698
Date: 10/1/2025
Course: TESD 1800
*/

import java.util.Random;
import java.util.Scanner;

public class ArrayIndexProgram {
    public static void main(String[] args) {
        // Step 1:creates the array with 100 random integers 
        int[] numbers = new int[100];
        Random random = new Random();
        for (int i = 0; i < numbers.length; i++) {
            numbers[i] = random.nextInt(1000); // Random integers between 0 and 999
        }

        // Step 2: Prompts number Entered by user for index
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter an index (0-99): ");

        try {
            int index = scanner.nextInt();

            // Step 3: Message Display based on input
            System.out.println("Value at index " + index + ": " + numbers[index]);
        } catch (ArrayIndexOutOfBoundsException e) {
            // Step 4: Handle out-of-bounds
            System.out.println("Out of Bounds");
        } catch (Exception e) {
            // Handle invalid input
            System.out.println("Invalid input. Please enter an integer.");
        } finally {
            scanner.close();
        }
    }
}

