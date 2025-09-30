/* 
 * 1800 TESD - Exercise 11-1: Simple Test Runner
 * Jeffrey Jenson - #6200029698
 * Date: 09/29/2025
 */

// I need to test if my Triangle class works right
// checking work is good policy, so i found a easier way to do things

public class TriangleTestRunner {
    // I'll count how many tests I do
    public static int totalTests = 0;
    public static int passedTests = 0;

    public static void main(String[] args) {
        System.out.println("Testing my Triangle class for Exercise 11-1");
        System.out.println("============================================");
        
        // Test each requirement one by one
        checkIfTriangleExtendsGeometricObject();
        checkDefaultValues();
        checkNoArgConstructor();
        checkThreeArgConstructor();
        checkGetterMethods();
        checkPerimeterMethod();
        checkAreaMethod();
        checkToStringMethod();
        checkInheritedStuff();
        checkEverythingTogether();
        
        // Show final results
        System.out.println("\n============================================");
        System.out.println("FINAL RESULTS:");
        System.out.println("Total tests: " + totalTests);
        System.out.println("Passed: " + passedTests);
        System.out.println("Failed: " + (totalTests - passedTests));
        
        if (passedTests == totalTests) {
            System.out.println("YES! All tests passed! My Triangle class works!");
        } else {
            System.out.println("OH NO! Some tests failed. I need to fix my code.");
        }
    }
    
    // Test 1: Does Triangle extend GeometricObject?
    public static void checkIfTriangleExtendsGeometricObject() {
        totalTests++;
        System.out.println("\nTest 1: Checking if Triangle extends GeometricObject");
        
        Triangle myTriangle = new Triangle();
        if (myTriangle instanceof GeometricObject) {
            passedTests++;
            System.out.println("PASS - Triangle extends GeometricObject");
        } else {
            System.out.println("FAIL - Triangle does not extend GeometricObject");
        }
    }
    
    // Test 2: Do the default values work?
    public static void checkDefaultValues() {
        totalTests++;
        System.out.println("\nTest 2: Checking default triangle values");
        
        Triangle defaultTriangle = new Triangle();
        double side1 = defaultTriangle.getSide1();
        double side2 = defaultTriangle.getSide2();
        double side3 = defaultTriangle.getSide3();
        
        if (side1 == 1.0 && side2 == 1.0 && side3 == 1.0) {
            passedTests++;
            System.out.println("PASS - Default sides are all 1.0");
        } else {
            System.out.println("FAIL - Default sides are: " + side1 + ", " + side2 + ", " + side3);
        }
    }
    
    // Test 3: Does the no-arg constructor work?
    public static void checkNoArgConstructor() {
        totalTests++;
        System.out.println("\nTest 3: Checking no-arg constructor");
        
        Triangle triangle = new Triangle();
        
        // Check if it has the right values
        boolean sidesOK = (triangle.getSide1() == 1.0 && 
                          triangle.getSide2() == 1.0 && 
                          triangle.getSide3() == 1.0);
        boolean colorOK = triangle.getColor().equals("white");
        boolean filledOK = (triangle.isFilled() == false);
        boolean dateOK = (triangle.getDateCreated() != null);
        
        if (sidesOK && colorOK && filledOK && dateOK) {
            passedTests++;
            System.out.println("PASS - No-arg constructor works");
        } else {
            System.out.println("FAIL - No-arg constructor has problems");
        }
    }
    
    // Test 4: Does the 3-arg constructor work?
    public static void checkThreeArgConstructor() {
        totalTests++;
        System.out.println("\nTest 4: Checking 3-arg constructor");
        
        Triangle triangle = new Triangle(3.0, 4.0, 5.0);
        
        if (triangle.getSide1() == 3.0 && 
            triangle.getSide2() == 4.0 && 
            triangle.getSide3() == 5.0) {
            passedTests++;
            System.out.println("PASS - 3-arg constructor sets sides correctly");
        } else {
            System.out.println("FAIL - 3-arg constructor doesn't work right");
        }
    }
    
    // Test 5: Do the getter methods work?
    public static void checkGetterMethods() {
        totalTests++;
        System.out.println("\nTest 5: Checking getter methods");
        
        Triangle triangle = new Triangle(2.5, 3.7, 4.1);
        
        if (triangle.getSide1() == 2.5 && 
            triangle.getSide2() == 3.7 && 
            triangle.getSide3() == 4.1) {
            passedTests++;
            System.out.println("PASS - Getter methods work");
        } else {
            System.out.println("FAIL - Getter methods don't work");
        }
    }
    
    // Test 6: Does getPerimeter() add up the sides?
    public static void checkPerimeterMethod() {
        totalTests++;
        System.out.println("\nTest 6: Checking perimeter calculation");
        
        Triangle triangle1 = new Triangle(); // should be 1+1+1 = 3
        Triangle triangle2 = new Triangle(3.0, 4.0, 5.0); // should be 3+4+5 = 12
        
        if (triangle1.getPerimeter() == 3.0 && triangle2.getPerimeter() == 12.0) {
            passedTests++;
            System.out.println("PASS - Perimeter calculation works");
        } else {
            System.out.println("FAIL - Perimeter calculation is wrong");
            System.out.println("Got: " + triangle1.getPerimeter() + " and " + triangle2.getPerimeter());
        }
    }
    
    // Test 7: Does getArea() use Heron's formula?
    public static void checkAreaMethod() {
        totalTests++;
        System.out.println("\nTest 7: Checking area calculation (Heron's formula)");
        
        Triangle triangle = new Triangle(3.0, 4.0, 5.0); // this is a right triangle, area should be 6
        double area = triangle.getArea();
        
        // I'll check if it's close to 6 (allowing for tiny rounding errors)
        if (Math.abs(area - 6.0) < 0.000001) {
            passedTests++;
            System.out.println("PASS - Area calculation works (got " + area + ")");
        } else {
            System.out.println("FAIL - Area calculation is wrong (got " + area + ", expected 6.0)");
        }
    }
    
    // Test 8: Does toString() give the right format?
    public static void checkToStringMethod() {
        totalTests++;
        System.out.println("\nTest 8: Checking toString() format");
        
        Triangle triangle1 = new Triangle();
        Triangle triangle2 = new Triangle(3.0, 4.0, 5.0);
        
        String result1 = triangle1.toString();
        String result2 = triangle2.toString();
        String expected1 = "Triangle: side1 = 1.0 side2 = 1.0 side3 = 1.0";
        String expected2 = "Triangle: side1 = 3.0 side2 = 4.0 side3 = 5.0";
        
        if (result1.equals(expected1) && result2.equals(expected2)) {
            passedTests++;
            System.out.println("PASS - toString() format is correct");
        } else {
            System.out.println("FAIL - toString() format is wrong");
            System.out.println("Expected: " + expected1);
            System.out.println("Got:      " + result1);
        }
    }
    
    // Test 9: Does Triangle inherit from GeometricObject properly?
    public static void checkInheritedStuff() {
        totalTests++;
        System.out.println("\nTest 9: Checking inherited GeometricObject features");
        
        Triangle triangle = new Triangle(3.0, 4.0, 5.0);
        
        // Check default values
        String color = triangle.getColor();
        boolean filled = triangle.isFilled();
        
        // Try changing them
        triangle.setColor("blue");
        triangle.setFilled(true);
        
        boolean everythingWorks = color.equals("white") && 
                                 filled == false && 
                                 triangle.getColor().equals("blue") && 
                                 triangle.isFilled() == true &&
                                 triangle.getDateCreated() != null;
        
        if (everythingWorks) {
            passedTests++;
            System.out.println("PASS - Inheritance from GeometricObject works");
        } else {
            System.out.println("FAIL - Inheritance problems");
        }
    }
    
    // Test 10: Big test with everything together
    public static void checkEverythingTogether() {
        totalTests++;
        System.out.println("\nTest 10: Final comprehensive test");
        
        // Make a (3,4,5) triangle, make it blue and filled
        Triangle triangle = new Triangle(3.0, 4.0, 5.0);
        triangle.setColor("blue");
        triangle.setFilled(true);
        
        // Check everything
        boolean isGeometricObject = (triangle instanceof GeometricObject);
        boolean sidesCorrect = (triangle.getSide1() == 3.0 && 
                               triangle.getSide2() == 4.0 && 
                               triangle.getSide3() == 5.0);
        boolean perimeterCorrect = (triangle.getPerimeter() == 12.0);
        boolean areaCorrect = (Math.abs(triangle.getArea() - 6.0) < 0.000001);
        boolean toStringCorrect = triangle.toString().equals("Triangle: side1 = 3.0 side2 = 4.0 side3 = 5.0");
        boolean colorCorrect = triangle.getColor().equals("blue");
        boolean filledCorrect = triangle.isFilled();
        boolean dateNotNull = (triangle.getDateCreated() != null);
        
        if (isGeometricObject && sidesCorrect && perimeterCorrect && areaCorrect && 
            toStringCorrect && colorCorrect && filledCorrect && dateNotNull) {
            passedTests++;
            System.out.println("PASS - Everything works together!");
            System.out.println("  Area: " + triangle.getArea());
            System.out.println("  Perimeter: " + triangle.getPerimeter());
            System.out.println("  Color: " + triangle.getColor());
            System.out.println("  Filled: " + triangle.isFilled());
            System.out.println("  Created: " + triangle.getDateCreated());
        } else {
            System.out.println("FAIL - Something is wrong in the final test");
        }
    }
}