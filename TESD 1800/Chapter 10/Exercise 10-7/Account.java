// Jeffrey Jenson - Stu#6200029698
// Date: 9/24/2025
// TESD 1800 – Exercise 10-7 (uses Account from 9.7)
// Minimal Account for ATM simulation
public class Account {
    private int id;
    private double balance;
    private static double annualInterestRate = 0.0; // not required for ATM, kept for 9.7 compatibility
    private java.util.Date dateCreated = new java.util.Date();

    public Account() {
        this(0, 0.0);
    }

    public Account(int id, double balance) {
        this.id = id;
        this.balance = balance;
    }

    // getters/setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public double getBalance() { return balance; }
    public void setBalance(double balance) { this.balance = balance; }

    public static double getAnnualInterestRate() { return annualInterestRate; }
    public static void setAnnualInterestRate(double rate) { annualInterestRate = rate; }

    public java.util.Date getDateCreated() { return dateCreated; }

    // interest helpers (from 9.7; not used by ATM but kept for completeness)
    public double getMonthlyInterestRate() { return annualInterestRate / 12.0; }
    public double getMonthlyInterest() { return balance * getMonthlyInterestRate() / 100.0; }

    // transactions
    public void withdraw(double amount) {
        if (amount < 0) return;           // ignore invalid
        if (amount <= balance) balance -= amount;
        // else ignore if insufficient funds (simple rules per assignment)
    }

    public void deposit(double amount) {
        if (amount < 0) return;           // ignore invalid
        balance += amount;
    }
}
