/*
 Author: Jeffrey Jenson
 Date: 2025-09-08

 Mod 7 Test — Part 1 & Part 2
 Part 1a: Attendance array matches seating chart (2D), minimal prompts.
 Part 1b: Display attendance table to verify counts.
 Part 2 : Read 25 exam scores, compute average and A/B/C/D/F counts with given ranges.
*/

import java.util.Scanner;

public class Mod7Test {

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);

        // Seating chart size: 5 x 5 = 25 students
        final int rows = 5;
        final int cols = 5;

        // Part 1a: Attendance structure sized to seating chart
        int[][] present = new int[rows][cols];

        // Part 1: Attendance
        System.out.print("Enter number of days to take attendance: ");
        int days = readInt(in, 1, 200);

        // Minimal prompting: one prompt per row per day
        for (int d = 1; d <= days; d++) {
            System.out.println("\nDay " + d + " (use P for present, A for absent)");
            for (int r = 0; r < rows; r++) {
                String line;
                while (true) {
                    System.out.print("Row " + (r + 1) + " (" + cols + " chars P/A): ");
                    line = in.next().trim();
                    if (line.length() == cols && onlyPA(line)) break;
                    System.out.println("  Invalid. Enter exactly " + cols + " characters with only P or A.");
                }
                for (int c = 0; c < cols; c++) {
                    char ch = Character.toUpperCase(line.charAt(c));
                    if (ch == 'P') present[r][c]++;
                }
            }
        }

        // Part 1b: Display attendance
        System.out.println("\n=== Attendance Summary (days present out of " + days + ") ===");
        printAttendanceTable(present);

        // Part 2: Exam Grades
        System.out.println("\n=== Enter 25 exam scores (0.00 - 100.00) ===");
        final int count = 25;
        double sum = 0.0;
        int a = 0, b = 0, c = 0, d = 0, f = 0;

        for (int i = 1; i <= count; i++) {
            System.out.print("Score " + i + ": ");
            double s = readDoubleRange(in, 0.0, 100.0);
            sum += s;

            if (s >= 90.0) a++;
            else if (s >= 80.0) b++;
            else if (s >= 70.0) c++;
            else if (s >= 60.0) d++;
            else f++;
        }

        double avg = sum / count;

        System.out.println("\n=== Grade Report ===");
        System.out.printf("Average: %.2f%n", avg);
        System.out.println("A (90.00 - 100.00): " + a);
        System.out.println("B (80.00 - 89.99):  " + b);
        System.out.println("C (70.00 - 79.99):  " + c);
        System.out.println("D (60.00 - 69.99):  " + d);
        System.out.println("F (0.00  - 59.99):  " + f);
    }

    // Helpers
    private static boolean onlyPA(String s) {
        for (int i = 0; i < s.length(); i++) {
            char ch = Character.toUpperCase(s.charAt(i));
            if (ch != 'P' && ch != 'A') return false;
        }
        return true;
    }

    private static int readInt(Scanner in, int min, int max) {
        while (true) {
            if (in.hasNextInt()) {
                int v = in.nextInt();
                if (v >= min && v <= max) return v;
            } else in.next();
            System.out.print("Enter an integer between " + min + " and " + max + ": ");
        }
    }

    private static double readDoubleRange(Scanner in, double min, double max) {
        while (true) {
            if (in.hasNextDouble()) {
                double v = in.nextDouble();
                if (v >= min && v <= max) return v;
            } else in.next();
            System.out.print("Enter a number between " + min + " and " + max + ": ");
        }
    }

    private static void printAttendanceTable(int[][] present) {
        int rows = present.length, cols = present[0].length;

        System.out.print("        ");
        for (int c = 0; c < cols; c++) System.out.print("C" + (c + 1) + "\t");
        System.out.println();

        for (int r = 0; r < rows; r++) {
            System.out.printf("Row %-3d", (r + 1));
            for (int c = 0; c < cols; c++) System.out.print(present[r][c] + "\t");
            System.out.println();
        }
    }
}
