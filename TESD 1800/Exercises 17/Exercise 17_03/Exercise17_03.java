/*
Name: Jeffrey Jenson
Course: TESD 1800 – Computer Programming II
Module: Module 7 – Chapter 17 Binary I/O
Assignment: Programming Exercise 17-3 (Exercise17_03.java)
Date: 10/28/2025*/

import java.io.*;
import java.util.Random;

public class Exercise17_03 {

    public static void main(String[] args) {
        String filename = "Exercise17_03.dat";
        createOrAppendIntegers(filename);
        int total = readAndSumIntegers(filename);
        System.out.println("Total sum of all integers in the file: " + total);
    }

    /** Method 1: Create or append random integers to the binary file */
    public static void createOrAppendIntegers(String filename) {
        Random rand = new Random();

        try (
            // FileOutputStream(true) = append mode
            DataOutputStream output = new DataOutputStream(
                    new BufferedOutputStream(
                            new FileOutputStream(filename, true)))
        ) {
            for (int i = 0; i < 100; i++) {
                int number = rand.nextInt(1000); // 0–999
                output.writeInt(number);
            }
            System.out.println(" Wrote 100 random integers to " + filename);
        } catch (IOException ex) {
            System.out.println("I/O Error while writing: " + ex.getMessage());
        }
    }

    /** Method 2: Read all integers from file and return their sum */
    public static int readAndSumIntegers(String filename) {
        int sum = 0;

        try (
            DataInputStream input = new DataInputStream(
                    new BufferedInputStream(
                            new FileInputStream(filename)))
        ) {
            while (true) {
                int value = input.readInt();
                sum += value;
            }
        } catch (EOFException ex) {
            // This exception is normal — it means end of file
        } catch (IOException ex) {
            System.out.println("I/O Error while reading: " + ex.getMessage());
        }

        return sum;
    }
}

