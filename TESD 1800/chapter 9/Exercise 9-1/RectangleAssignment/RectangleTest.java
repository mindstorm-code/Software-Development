public class RectangleTest {
    public static void main(String[] args) { // this is the Main so its the main program that replicates the other code.
        Rectangle r1 = new Rectangle(4, 40);
        Rectangle r2 = new Rectangle(3.5, 35.9);

        System.out.println("r1: width=" + r1.getWidth() + ", height=" + r1.getHeight() + ", area=" + r1.getArea() + ", perimeter=" + r1.getPerimeter());
        System.out.println("r2: width=" + r2.getWidth() + ", height=" + r2.getHeight() + ", area=" + r2.getArea() + ", perimeter=" + r2.getPerimeter());
    }
}
