/*
Exercise 9-7
Date: 09/16/2025
Student: Jeffrey Jenson — Stu#6200029698
Course: TESD 1800 — Computer Programming
*/

import java.util.Date;

public class Account {
    private int id = 0;
    private double balance = 0;
    private static double annualInterestRate = 0;
    private Date dateCreated;

    // no-arg constructor
    public Account() {
        dateCreated = new Date();
    }

    // constructor with id and balance
    public Account(int id, double balance) {
        this.id = id;
        this.balance = balance;
        dateCreated = new Date();
    }

    // getters
    public int getId() { return id; }
    public double getBalance() { return balance; }
    public static double getAnnualInterestRate() { return annualInterestRate; }
    public Date getDateCreated() { return dateCreated; }

    // setters
    public void setId(int id) { this.id = id; }
    public void setBalance(double balance) { this.balance = balance; }
    public static void setAnnualInterestRate(double rate) { annualInterestRate = rate; }

    // interest
    public double getMonthlyInterestRate() {
        return annualInterestRate / 12;
    }

    public double getMonthlyInterest() {
        return balance * getMonthlyInterestRate() / 100; // divide by 100 for %
    }

    // withdraw/deposit
    public void withdraw(double amount) {
        balance -= amount;
    }

    public void deposit(double amount) {
        balance += amount;
    }
}
