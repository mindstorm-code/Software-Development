// Exercise 12-15: Write/Read Data
// Student: Jeffrey Jenson - Stu#6200029698
// Date: 10/01/2025
// Course: TESD 1800

import java.io.*;
import java.util.*;

public class Exercise12_15 {
    public static void main(String[] args) throws IOException {
        File file = new File("Exercise12_15.txt");

        // Step 1: Create the file if it does not exist
        if (!file.exists()) {
            PrintWriter output = new PrintWriter(file);

            // Write 100 random integers to the file (0–999)
            for (int i = 0; i < 100; i++) {
                int number = (int)(Math.random() * 1000);
                output.print(number + " ");
            }

            output.close(); // Close file writer
            System.out.println("File created and 100 random integers written.");
        }

        // Step 2: Read integers back from file
        ArrayList<Integer> numbers = new ArrayList<>();
        Scanner input = new Scanner(file);

        while (input.hasNextInt()) {
            numbers.add(input.nextInt());
        }
        input.close();

        // Step 3: Sort the numbers
        Collections.sort(numbers);

        // Step 4: Display sorted numbers
        System.out.println("Numbers in increasing order:");
        for (int n : numbers) {
            System.out.print(n + " ");
        }
    }
}

// answer to questions
// 1 = Write → PrintWriter
// 2 = Read → Scanner