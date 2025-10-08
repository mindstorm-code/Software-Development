import java.util.Date;

/*
  Exercise 13-7: Colorable Triangle Program
  TESD 1800 Course
  Jeffrey Jenson
  10/8/2025
 */

// Colorable interface
interface Colorable {
    void howToColor();
}

// Abstract GeometricObject class
abstract class GeometricObject {
    private String color = "white";
    private boolean filled;
    private Date dateCreated;

    protected GeometricObject() {
        dateCreated = new Date();
    }

    protected GeometricObject(String color, boolean filled) {
        dateCreated = new Date();
        this.color = color;
        this.filled = filled;
    }

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

    public Date getDateCreated() {
        return dateCreated;
    }

    @Override
    public String toString() {
        return "created on " + dateCreated + "\ncolor: " + color + 
               " and filled: " + filled;
    }

    public abstract double getArea();
    public abstract double getPerimeter();
}

// Triangle class
class Triangle extends GeometricObject implements Colorable {
    private double side1 = 1.0;
    private double side2 = 1.0;
    private double side3 = 1.0;

    public Triangle() {
    }

    public Triangle(double side1, double side2, double side3) {
        this.side1 = side1;
        this.side2 = side2;
        this.side3 = side3;
    }

    public Triangle(double side1, double side2, double side3, String color, boolean filled) {
        super(color, filled);
        this.side1 = side1;
        this.side2 = side2;
        this.side3 = side3;
    }

    public double getSide1() {
        return side1;
    }

    public void setSide1(double side1) {
        this.side1 = side1;
    }

    public double getSide2() {
        return side2;
    }

    public void setSide2(double side2) {
        this.side2 = side2;
    }

    public double getSide3() {
        return side3;
    }

    public void setSide3(double side3) {
        this.side3 = side3;
    }

    @Override
    public double getArea() {
        double s = (side1 + side2 + side3) / 2;
        return Math.sqrt(s * (s - side1) * (s - side2) * (s - side3));
    }

    @Override
    public double getPerimeter() {
        return side1 + side2 + side3;
    }

    @Override
    public void howToColor() {
        System.out.println("Color all three sides");
    }

    @Override
    public String toString() {
        return "Triangle: side1 = " + side1 + " side2 = " + side2 + " side3 = " + side3;
    }
}

// Circle class 
class Circle extends GeometricObject {
    private double radius;

    public Circle() {
    }

    public Circle(double radius) {
        this.radius = radius;
    }

    public Circle(double radius, String color, boolean filled) {
        super(color, filled);
        this.radius = radius;
    }

    public double getRadius() {
        return radius;
    }

    public void setRadius(double radius) {
        this.radius = radius;
    }

    @Override
    public double getArea() {
        return radius * radius * Math.PI;
    }

    @Override
    public double getPerimeter() {
        return 2 * radius * Math.PI;
    }

    @Override
    public String toString() {
        return "Circle: radius = " + radius;
    }
}

// Main test class
public class Exercise13_7 {
    public static void main(String[] args) {
        // Create an array of five GeometricObjects
        GeometricObject[] objects = new GeometricObject[5];
        
        // Initialize the array with different geometric objects
        objects[0] = new Triangle(3, 4, 5, "red", true);
        objects[1] = new Circle(5, "blue", false);
        objects[2] = new Triangle(6, 8, 10, "green", true);
        objects[3] = new Circle(3, "yellow", true);
        objects[4] = new Triangle(5, 5, 5, "purple", false);
        
        // For each object in the array, display its area and invoke howToColor if colorable
        for (int i = 0; i < objects.length; i++) {
            System.out.println("\nObject " + (i + 1) + ":");
            System.out.println(objects[i].toString());
            System.out.printf("Area: %.2f%n", objects[i].getArea());
            
            // Check if the object is colorable
            if (objects[i] instanceof Colorable) {
                System.out.print("How to color: ");
                ((Colorable) objects[i]).howToColor();
            } else {
                System.out.println("This object is not colorable.");
            }
        }
    }
}