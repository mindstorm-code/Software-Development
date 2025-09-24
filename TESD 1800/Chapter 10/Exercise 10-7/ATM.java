/* Jeffrey Jenson - Stu#6200029698
 Date: 9/24/2025
 TESD 1800 – Exercise 10-7 (uses Account from 9.7) */
import java.util.Scanner;

public class ATM {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);

        // Create 10 accounts with ids 0..9 and $100 balance
        Account[] accounts = new Account[10];
        for (int i = 0; i < accounts.length; i++) {
            accounts[i] = new Account(i, 100.0);
        }

        while (true) { // system never stops
            int id = promptForId(in);

            // session menu loop
            while (true) {
                int choice = menuAndChoice(in);

                if (choice == 1) {
                    System.out.printf("Balance: $%.2f%n", accounts[id].getBalance());
                } else if (choice == 2) {
                    System.out.print("Enter amount to withdraw: ");
                    double amt = safeNextDouble(in);
                    double before = accounts[id].getBalance();
                    accounts[id].withdraw(amt);
                    if (accounts[id].getBalance() == before && amt > before) {
                        System.out.println("Insufficient funds.");
                    }
                } else if (choice == 3) {
                    System.out.print("Enter amount to deposit: ");
                    double amt = safeNextDouble(in);
                    accounts[id].deposit(amt);
                } else if (choice == 4) {
                    System.out.println("Logging out...\n");
                    break; // exit to ID prompt
                } else {
                    System.out.println("Invalid choice. Try again.");
                }
            }
        }
    }

    private static int promptForId(Scanner in) {
        while (true) {
            System.out.print("Enter an id (0–9): ");
            if (in.hasNextInt()) {
                int id = in.nextInt();
                if (id >= 0 && id <= 9) return id;
            } else {
                in.next(); // clear bad token
            }
            System.out.println("Invalid id. Please try again.");
        }
    }

    private static int menuAndChoice(Scanner in) {
        System.out.println("\nMain menu");
        System.out.println("1: check balance");
        System.out.println("2: withdraw");
        System.out.println("3: deposit");
        System.out.println("4: exit");
        System.out.print("Enter a choice: ");
        while (!in.hasNextInt()) {
            in.next();
            System.out.print("Enter a number 1–4: ");
        }
        return in.nextInt();
    }

    private static double safeNextDouble(Scanner in) {
        while (!in.hasNextDouble()) {
            in.next();
            System.out.print("Enter a valid amount: ");
        }
        return in.nextDouble();
    }
}
