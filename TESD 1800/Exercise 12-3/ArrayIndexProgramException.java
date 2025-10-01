/*
Exercise 12-3: Implementation (Exception Handling)
Student: Jeffrey Jenson — Stu#6200029698
Date: 10/1/2025
Course: TESD 1800
*/

import java.util.Random;
import java.util.Scanner;

public class ArrayIndexProgramException {

    public static void main(String[] args) {
        // Step 1: Create an array with 100 random integers (0–99)
        int[] numbers = new int[100];
        Random random = new Random();
        for (int i = 0; i < numbers.length; i++) {
            numbers[i] = random.nextInt(100); // random 0–99
        }

        // Step 2: Prompt the user for an index
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter an index (0–99): ");

        try {
            int index = scanner.nextInt();  // may throw InputMismatchException
            // Step 3: Try to access the element
            System.out.println("Value at index " + index + ": " + numbers[index]);
        } 
        catch (ArrayIndexOutOfBoundsException e) {
            // If index < 0 or >= 100
            System.out.println("Out of Bounds");
        } 
        catch (Exception e) {
            // If user enters something that’s not an integer
            System.out.println("Invalid input. Please enter a whole number.");
        } 
        finally {
            scanner.close();
        }
    }
}
