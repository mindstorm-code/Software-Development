/*
Name: Jeffrey Jenson
Course: TESD 1800 – Computer Programming II
Module: Module 7 – Chapter 17 Binary I/O and Text I/O
Assignment: Programming Exercise 17-1 (Exercise17_01.java)
Date: 10/28/2025
*/

import java.io.FileWriter;
import java.io.PrintWriter;
import java.io.IOException;
import java.util.Random;

public class Exercise17_01 {

    public static void main(String[] args) {
        try {
            // Step 1: Open the file in append mode.
            FileWriter fw = new FileWriter("Exercise17_01.txt", true);

            // Step 2: Wrap FileWriter in a PrintWriter
            PrintWriter output = new PrintWriter(fw);

            // Step 3: Make a Random object to generate random integers
            Random rand = new Random();

            // Step 4: Generate and write 100 random integers 
            for (int i = 0; i < 100; i++) {
                int num = rand.nextInt(1000); // 0 to 999
                output.print(num + " ");
            }

            // Optional: write a newline at the end so each run is on its own line
            output.println();

            // Step 5: Close the stream to actually flush data to disk
            output.close();

            System.out.println("Done. Wrote 100 integers to Exercise17_01.txt");

        } catch (IOException ex) {
            System.out.println("I/O Error: " + ex.getMessage());
        }
    }
}
