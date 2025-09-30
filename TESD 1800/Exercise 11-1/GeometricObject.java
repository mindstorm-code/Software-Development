/* 
 * 1800 TESD - Exercise 11-1: (GeometricObject) Implementation
 * Jeffrey Jenson - #6200029698
 * Date: 09/29/2025
 */

import java.util.Date;

public class GeometricObject {
    private String color = "white";
    private boolean filled;
    private Date dateCreated;

    // No-arg constructor
    public GeometricObject() {
        dateCreated = new Date();
    }

    // Constructor with color and filled
    public GeometricObject(String color, boolean filled) {
        this();
        this.color = color;
        this.filled = filled;
    }

    // Accessors / Mutators
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public boolean isFilled() { return filled; }
    public void setFilled(boolean filled) { this.filled = filled; }

    public Date getDateCreated() { return dateCreated; }

    @Override
    public String toString() {
        return "created on " + dateCreated + ", color: " + color + ", filled: " + filled;
    }
}
