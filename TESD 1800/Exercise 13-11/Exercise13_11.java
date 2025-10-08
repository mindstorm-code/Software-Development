/*
 * Exercise 13.11 Impliment the Octagon class that extends GeometricObject and
 * Jeffrey Jenson Stu#6200029698
 * 10/08/2025
 */
abstract class GeometricObject {
    private String color = "white";
    private boolean filled;
    private java.util.Date dateCreated;

    public GeometricObject() {
        dateCreated = new java.util.Date();
    }

    public GeometricObject(String color, boolean filled) {
        dateCreated = new java.util.Date();
        this.color = color;
        this.filled = filled;
    }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public boolean isFilled() { return filled; }
    public void setFilled(boolean filled) { this.filled = filled; }
    public java.util.Date getDateCreated() { return dateCreated; }

    @Override
    public String toString() {
        return "Created on " + dateCreated + "\nColor: " + color +
               "\nFilled: " + filled;
    }

    public abstract double getArea();
    public abstract double getPerimeter();
}

// Octagon Class

class Octagon extends GeometricObject implements Comparable<Octagon>, Cloneable {
    private double side;

    public Octagon() {
        this(1.0);
    }

    public Octagon(double side) {
        this.side = side;
    }

    public double getSide() { return side; }
    public void setSide(double side) { this.side = side; }

    @Override
    public double getArea() {
        // Formula for a regular octagon: area = (2 + 4/√2) * side²
        return (2 + 4 / Math.sqrt(2)) * side * side;
    }

    @Override
    public double getPerimeter() {
        return 8 * side;
    }

    // Compare by area
    @Override
    public int compareTo(Octagon o) {
        return Double.compare(this.getArea(), o.getArea());
    }

    // Cloneable interface implementation
    @Override
    public Object clone() {
        try {
            return super.clone(); // shallow copy OK
        } catch (CloneNotSupportedException e) {
            return null;
        }
    }

    @Override
    public String toString() {
        return "Octagon(side = " + side + ", area = " + getArea() +
               ", perimeter = " + getPerimeter() + ")";
    }
}

// Test Program
public class Exercise13_11 {
    public static void main(String[] args) {
        // Create an Octagon
        Octagon o1 = new Octagon(5);

        // Clone it
        Octagon o2 = (Octagon) o1.clone();

        // Display both
        System.out.println("Original: " + o1);
        System.out.println("Clone:    " + o2);

        // Compare results
        System.out.println("\nSame object? " + (o1 == o2));
        System.out.println("Equal area? " + (o1.getArea() == o2.getArea()));

        Octagon bigger = new Octagon(6);
        System.out.println("Compare o1 to bigger: " + o1.compareTo(bigger));
    }
}
