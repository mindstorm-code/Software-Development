/* 
 * 1800 TESD - Exercise 11-3: Implementation
 * Jeffrey Jenson - #6200029698
 * Date: 09/29/2025
 */

import java.util.Date;

public class Account {
    private int accountNumber;
    private double balance;
    private double annualInterestRate; // as a percent, e.g., 3.5 means 3.5%
    private Date dateCreated;

    // No-arg constructor
    public Account() {
        this.dateCreated = new Date();
    }

    // Constructor with account number and starting balance
    public Account(int accountNumber, double balance) {
        this.accountNumber = accountNumber;
        this.balance = balance;
        this.dateCreated = new Date();
    }

    // Getters / Setters
    public int getAccountNumber() { return accountNumber; }
    public void setAccountNumber(int accountNumber) { this.accountNumber = accountNumber; }

    public double getBalance() { return balance; }
    protected void setBalance(double balance) { this.balance = balance; } // protected for subclasses

    public double getAnnualInterestRate() { return annualInterestRate; }
    public void setAnnualInterestRate(double annualInterestRate) { this.annualInterestRate = annualInterestRate; }

    public Date getDateCreated() { return dateCreated; }

    // Deposit
    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Deposit must be positive.");
        balance += amount;
    }

    // Withdraw (base behavior = do not allow overdraft)
    public void withdraw(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Withdrawal must be positive.");
        if (amount > balance) throw new IllegalArgumentException("Insufficient funds.");
        balance -= amount;
    }

    // Monthly interest (helper if needed)
    public double getMonthlyInterestRate() {
        return annualInterestRate / 12.0 / 100.0; // convert percent -> fraction
    }

    public double getMonthlyInterest() {
        return balance * getMonthlyInterestRate();
    }

    @Override
    public String toString() {
        return "Account{"
                + "accountNumber=" + accountNumber
                + ", balance=" + balance
                + ", annualInterestRate=" + annualInterestRate
                + ", dateCreated=" + dateCreated
                + "}";
    }
}
