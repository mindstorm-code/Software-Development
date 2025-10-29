/*
Name: Jeffrey Jenson
Course: TESD 1800 – Computer Programming II
Module: Module 7 – Chapter 17 Binary I/O
Assignment: Programming Exercise 17-14 (Encrypt files)
Date: 10/29/2025
*/

import java.io.*;
import java.util.Scanner;

public class Exercise17_14 {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        System.out.print("Enter the input file name: ");
        String inputFileName = input.nextLine();

        System.out.print("Enter the output file name (for encrypted version): ");
        String outputFileName = input.nextLine();

        try (
            BufferedInputStream inStream =
                new BufferedInputStream(new FileInputStream(inputFileName));
            BufferedOutputStream outStream =
                new BufferedOutputStream(new FileOutputStream(outputFileName))
        ) {
            int value;
            while ((value = inStream.read()) != -1) {
                outStream.write(value + 5);  // Add 5 to each byte
            }

            System.out.println(" Encryption complete. Encrypted file: " + outputFileName);

        } catch (FileNotFoundException ex) {
            System.out.println("File not found: " + ex.getMessage());
        } catch (IOException ex) {
            System.out.println("I/O Error: " + ex.getMessage());
        }

        input.close();
    }
}
