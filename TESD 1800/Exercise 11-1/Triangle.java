/* 
 * 1800 TESD - Exercise 11-1: Implementation
 * Jeffrey Jenson - #6200029698
 * Date: 09/29/2025
 */

public class Triangle extends GeometricObject {
    private double side1 = 1.0;
    private double side2 = 1.0;
    private double side3 = 1.0;

    // No-arg constructor (default triangle 1.0, 1.0, 1.0)
    public Triangle() {
        super();
    }

    // Constructor with specified sides
    public Triangle(double side1, double side2, double side3) {
        super();
        this.side1 = side1;
        this.side2 = side2;
        this.side3 = side3;
    }

    // Optional convenience constructor with color/filled as well
    public Triangle(double side1, double side2, double side3, String color, boolean filled) {
        super(color, filled);
        this.side1 = side1;
        this.side2 = side2;
        this.side3 = side3;
    }

    // Accessors
    public double getSide1() { return side1; }
    public double getSide2() { return side2; }
    public double getSide3() { return side3; }

    // Perimeter
    public double getPerimeter() {
        return side1 + side2 + side3;
    }

    // Area via Heron's formula: sqrt(s*(s-a)*(s-b)*(s-c)), s = perimeter/2
    public double getArea() {
        double s = getPerimeter() / 2.0;
        return Math.sqrt(s * (s - side1) * (s - side2) * (s - side3));
    }

    public String toString() {
        return "Triangle: side1 = " + side1 + " side2 = " + side2 + " side3 = " + side3;
    }
}
