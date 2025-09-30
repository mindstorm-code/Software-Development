/* 
 * 1800 TESD - Exercise 11-1: Implementation
 * Jeffrey Jenson - #6200029698
 * Date: 09/29/2025
 */

import java.util.Scanner;
import java.text.DecimalFormat;

public class TriangleTest {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        DecimalFormat df = new DecimalFormat("#.####");

        // Prompt for sides
        System.out.print("Enter side1: ");
        double s1 = input.nextDouble();

        System.out.print("Enter side2: ");
        double s2 = input.nextDouble();

        System.out.print("Enter side3: ");
        double s3 = input.nextDouble();
        input.nextLine(); // consume newline

        // Prompt for color
        System.out.print("Enter color: ");
        String color = input.nextLine().trim();

        // Prompt for filled
        System.out.print("Is the triangle filled? (true/false): ");
        boolean filled = Boolean.parseBoolean(input.nextLine().trim());

        // Create Triangle, set color/filled
        Triangle tri = new Triangle(s1, s2, s3);
        tri.setColor(color);
        tri.setFilled(filled);

        // Display requested info
        System.out.println();
        System.out.println(tri.toString());
        System.out.println("Perimeter: " + df.format(tri.getPerimeter()));
        System.out.println("Area: " + df.format(tri.getArea()));
        System.out.println("Color: " + tri.getColor());
        System.out.println("Date created: " + tri.getDateCreated());
        System.out.println("Filled: " + tri.isFilled());

        input.close();
    }
}