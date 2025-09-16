/*
Exercise 9-1
Date: 09/16/2025
Student: Jeffrey Jenson — Stu#6200029698
Course: TESD 1800 — Computer Programming
*/

public class Rectangle {
    // data fields
    private double width = 1.0;   // default width
    private double height = 1.0;  // default height

    // no-arg constructor -> 1x1 rectangle
    public Rectangle() {}

    // constructor with specified width & height
    public Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }
//methods to return area and perimeter
    public double getArea() {
        return width * height;
    }

    public double getPerimeter() {
        return 2 * (width + height);
    }

    public double getWidth() { return width; }
    public double getHeight() { return height; }
}


