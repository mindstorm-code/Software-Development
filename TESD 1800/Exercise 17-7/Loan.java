/*
Name: Jeffrey Jenson
Course: TESD 1800 – Computer Programming II
Module: Module 7 – Chapter 17 Binary I/O / Object I/O
Assignment: Programming Exercise 17-7 (Loan.java)
Date: 10/29/2025
*/

import java.io.Serializable;
import java.util.Date;

public class Loan implements Serializable {

    // It's good practice to include a serialVersionUID for Serializable classes
    private static final long serialVersionUID = 1L;

    private double annualInterestRate; // e.g. 5.5 for 5.5%
    private int numberOfYears;         // loan term in years
    private double loanAmount;         // principal
    private Date loanDate;             // when the loan was created

    // No-arg constructor with default values
    public Loan() {
        this(2.5, 1, 1000); // defaults like Liang’s example
    }

    // Main constructor
    public Loan(double annualInterestRate, int numberOfYears, double loanAmount) {
        this.annualInterestRate = annualInterestRate;
        this.numberOfYears = numberOfYears;
        this.loanAmount = loanAmount;
        this.loanDate = new Date(); // timestamp of creation
    }

    // Getters and setters
    public double getAnnualInterestRate() {
        return annualInterestRate;
    }

    public void setAnnualInterestRate(double annualInterestRate) {
        this.annualInterestRate = annualInterestRate;
    }

    public int getNumberOfYears() {
        return numberOfYears;
    }

    public void setNumberOfYears(int numberOfYears) {
        this.numberOfYears = numberOfYears;
    }

    public double getLoanAmount() {
        return loanAmount;
    }

    public void setLoanAmount(double loanAmount) {
        this.loanAmount = loanAmount;
    }

    public Date getLoanDate() {
        return loanDate;
    }

    // Monthly payment formula
    public double getMonthlyPayment() {
        double monthlyInterestRate = annualInterestRate / 1200.0;
        double monthlyPayment = (loanAmount * monthlyInterestRate) /
                (1 - (1 / Math.pow(1 + monthlyInterestRate, numberOfYears * 12)));
        return monthlyPayment;
    }

    // Total payment over the full term
    public double getTotalPayment() {
        return getMonthlyPayment() * numberOfYears * 12;
    }

    @Override
    public String toString() {
        return "Loan { rate=" + annualInterestRate +
               "%, years=" + numberOfYears +
               ", amount=$" + loanAmount +
               ", date=" + loanDate +
               " }";
    }
}
