/*
Exercise 8-9
Date: 9/8/2025
Student: Jeffrey Jenson — Stu#6200029698
Course: TESD 1400 — Computer Programming
Description: Tic-Tac-Toe game where two players take turns 
placing X and O until the grid is full. No winner check required.
*/

import java.util.Scanner;

public class TicTacToe {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        // Step 1: Create 3x3 grid initialized with spaces
        String[][] board = new String[3][3];
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                board[i][j] = " ";
            }
        }

        // Step 2: Play until all 9 moves are made
        int moves = 0;
        String currentPlayer = "X";

        while (moves < 9) {
            // Display board
            printBoard(board);

            // Ask current player for row/col
            System.out.println("Player x", enter row (0-2) and column (0-2): ");
            int row = input.nextInt();
            int col = input.nextInt();

            // Check if valid move
            if (row < 0 || row > 2 || col < 0 || col > 2) {
                System.out.println("Invalid position! Try again. - TicTacToe.java:39" );
                continue;
            }

            if (!board[row][col].equals(" ")) {
                System.out.println("That spot is already taken! Try again. - TicTacToe.java:44");
                continue;
            }

            // Place token
            board[row][col] = currentPlayer;
            moves++;

            // Switch player
            currentPlayer = currentPlayer.equals("X") ? "O" : "X";
        }

        // Final board after 9 moves
        printBoard(board);
        System.out.println("Game over. All spots are filled! - TicTacToe.java:58");
    }

    // Method to display board
    public static void printBoard(String[][] board) {
        System.out.println("");
        for (int i = 0; i < 3; i++) {
            System.out.print("");
            for (int j = 0; j < 3; j++) {
                System.out.print(" " + board[i][j] + " |");
            }
            System.out.println();
            System.out.println("");
        }
    }
}
