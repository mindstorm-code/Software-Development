/*
===============================================================
Exercise 13-1: Implementation
Student: Jeffrey Jenson — Stu#6200029698
Date: 10/8/2025
Course: TESD 1800
===============================================================
*/

import java.util.Scanner;

// =============================================================
// Abstract Parent Class: GeometricObject
// =============================================================
abstract class GeometricObject {

    private String color = "white";
    private boolean filled;
    private java.util.Date dateCreated;

    // Default constructor
    public GeometricObject() {
        dateCreated = new java.util.Date();
    }

    // Constructor with color and filled
    public GeometricObject(String color, boolean filled) {
        dateCreated = new java.util.Date();
        this.color = color;
        this.filled = filled;
    }

    // Getters and setters
    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public boolean isFilled() {
        return filled;
    }

    public void setFilled(boolean filled) {
        this.filled = filled;
    }

    public java.util.Date getDateCreated() {
        return dateCreated;
    }

    // Abstract methods for subclasses to implement
    public abstract double getArea();
    public abstract double getPerimeter();

    @Override
    public String toString() {
        return "Created on " + dateCreated + "\nColor: " + color + " and filled: " + filled;
    }
}

// =============================================================
// Child Class: Triangle
// =============================================================
class Triangle extends GeometricObject {

    private double side1;
    private double side2;
    private double side3;

    // Default constructor
    public Triangle() {
        this(1.0, 1.0, 1.0);
    }

    // Constructor with all sides
    public Triangle(double side1, double side2, double side3) {
        this.side1 = side1;
        this.side2 = side2;
        this.side3 = side3;
    }

    // Getters
    public double getSide1() {
        return side1;
    }

    public double getSide2() {
        return side2;
    }

    public double getSide3() {
        return side3;
    }

    // Override abstract methods
    @Override
    public double getArea() {
        double s = (side1 + side2 + side3) / 2; // semi-perimeter
        return Math.sqrt(s * (s - side1) * (s - side2) * (s - side3)); // Heron’s formula
    }

    @Override
    public double getPerimeter() {
        return side1 + side2 + side3;
    }

    @Override
    public String toString() {
        return "Triangle: side1 = " + side1 + " side2 = " + side2 + " side3 = " + side3;
    }
}

// =============================================================
// Test Program
// =============================================================
public class TestTriangle {

    public static void main(String[] args) {

        Scanner input = new Scanner(System.in);

        // Prompt user for sides
        System.out.print("Enter three sides of the triangle: ");
        double side1 = input.nextDouble();
        double side2 = input.nextDouble();
        double side3 = input.nextDouble();

        // Prompt for color and filled
        System.out.print("Enter a color: ");
        String color = input.next();

        System.out.print("Is the triangle filled? (true/false): ");
        boolean filled = input.nextBoolean();

        // Create triangle object
        Triangle triangle = new Triangle(side1, side2, side3);
        triangle.setColor(color);
        triangle.setFilled(filled);

        // Display results
        System.out.println("\n" + triangle.toString());
        System.out.println("Color: " + triangle.getColor());
        System.out.println("Filled: " + triangle.isFilled());
        System.out.printf("Area: %.2f\n", triangle.getArea());
        System.out.printf("Perimeter: %.2f\n", triangle.getPerimeter());

        input.close();
    }
}
