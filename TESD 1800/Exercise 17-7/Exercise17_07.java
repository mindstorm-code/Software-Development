/*
Name: Jeffrey Jenson
Course: TESD 1800 – Computer Programming II
Module: Module 7 – Chapter 17 Binary/Object I/O
Assignment: Programming Exercise 17-7 (Exercise17_07.java)
Date: 10/29/2025
*/

import java.io.*;
import java.util.ArrayList;

public class Exercise17_07 {

    public static void main(String[] args) {

        String filename = "Exercise17_07.dat";

        // Write Loan objects to the file
        writeLoans(filename);

        // Reads the data back and display total loan amount
        outputData(filename);
    }

    // This method writes some Loan objects to Exercise17_07.dat
    public static void writeLoans(String filename) {
        try (
            ObjectOutputStream output =
                new ObjectOutputStream(
                    new BufferedOutputStream(
                        new FileOutputStream(filename)))
        ) {
            // Create some Loan objects (example data)
            Loan loan1 = new Loan(5.0, 30, 250000); // 5% for 30 yrs, $250k
            Loan loan2 = new Loan(4.5, 15, 180000); // 4.5% for 15 yrs, $180k
            Loan loan3 = new Loan(6.25, 5, 15000);  // 6.25% for 5 yrs, $15k

            // Write them to file
            output.writeObject(loan1);
            output.writeObject(loan2);
            output.writeObject(loan3);

            System.out.println("Wrote Loan objects to " + filename);

        } catch (IOException ex) {
            System.out.println("I/O Error while writing loans: " + ex.getMessage());
        }
    }

    // This is the method your assignment asks you to add: Loan objects from the file and displays the total loan amount
    public static void outputData(String filename) {
        double totalLoanAmount = 0.0;
        int count = 0;
        ArrayList<Loan> loadedLoans = new ArrayList<>();

        try (
            ObjectInputStream input =
                new ObjectInputStream(
                    new BufferedInputStream(
                        new FileInputStream(filename)))
        ) {
            while (true) {
                // Keep reading Loan objects until we hit EOFException
                Object obj = input.readObject();

                if (obj instanceof Loan) {
                    Loan loan = (Loan) obj;
                    loadedLoans.add(loan);
                    totalLoanAmount += loan.getLoanAmount();
                    count++;
                } else {
                    // If somehow the file has something else in it
                    System.out.println("Warning: non-Loan object found in file.");
                }
            }

        } catch (EOFException eof) {
            // Normal: this means we hit end of file.
            System.out.println("Finished reading Loan objects.");
        } catch (ClassNotFoundException cnf) {
            System.out.println("Class not found while reading objects: " + cnf.getMessage());
        } catch (IOException ex) {
            System.out.println("I/O Error while reading loans: " + ex.getMessage());
        }

        // Print summary / total
        System.out.println("Total number of loans read: " + count);
        System.out.println("Total loan amount: $" + totalLoanAmount);

        // Optional: show each loan for debugging / proving it worked
        for (Loan l : loadedLoans) {
            System.out.println(l);
        }
    }
}
