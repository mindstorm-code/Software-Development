// Jeffrey Jenson - Stu#6200029698
// Date: 9/24/2025
// Exercise 10-3: Client Program to Test MyInteger

public class TestMyInteger {
    public static void main(String[] args) {
        MyInteger n1 = new MyInteger(17);
        MyInteger n2 = new MyInteger(28);

        // test non-static methods
        System.out.println("n1 = " + n1.getValue());
        System.out.println("Is n1 even? " + n1.isEven());
        System.out.println("Is n1 odd? " + n1.isOdd());
        System.out.println("Is n1 prime? " + n1.isPrime());

        System.out.println("\nn2 = " + n2.getValue());
        System.out.println("Is n2 even? " + n2.isEven());
        System.out.println("Is n2 odd? " + n2.isOdd());
        System.out.println("Is n2 prime? " + n2.isPrime());

        // test static methods with int
        System.out.println("\nStatic method checks with int 29:");
        System.out.println("Even? " + MyInteger.isEven(29));
        System.out.println("Odd? " + MyInteger.isOdd(29));
        System.out.println("Prime? " + MyInteger.isPrime(29));

        // test static methods with MyInteger
        System.out.println("\nStatic method checks with MyInteger n1:");
        System.out.println("Even? " + MyInteger.isEven(n1));
        System.out.println("Odd? " + MyInteger.isOdd(n1));
        System.out.println("Prime? " + MyInteger.isPrime(n1));

        // test equals
        System.out.println("\nDoes n1 equal 17? " + n1.equals(17));
        System.out.println("Does n1 equal n2? " + n1.equals(n2));

        // test parseInt
        char[] charArray = {'1', '2', '3'};
        String str = "456";
        System.out.println("\nParse char array {'1','2','3'} → " + MyInteger.parseInt(charArray));
        System.out.println("Parse string \"456\" → " + MyInteger.parseInt(str));
    }
}
