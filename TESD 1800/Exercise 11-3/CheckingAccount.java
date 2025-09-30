public class CheckingAccount extends Account {
    private double overdraftLimit; // e.g., 500 means balance can go down to -500

    public CheckingAccount() {
        super();
    }

    public CheckingAccount(int accountNumber, double balance, double overdraftLimit) {
        super(accountNumber, balance);
        this.overdraftLimit = overdraftLimit;
    }

    public double getOverdraftLimit() { return overdraftLimit; }
    public void setOverdraftLimit(double overdraftLimit) { this.overdraftLimit = overdraftLimit; }

    @Override
    public void withdraw(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Withdrawal must be positive.");
        double newBalance = getBalance() - amount;
        // allowed as long as balance doesn't drop below -overdraftLimit
        if (newBalance < -overdraftLimit) {
            throw new IllegalArgumentException("Overdraft limit exceeded.");
        }
        setBalance(newBalance);
    }

    @Override
    public String toString() {
        return "CheckingAccount{"
                + "accountNumber=" + getAccountNumber()
                + ", balance=" + getBalance()
                + ", annualInterestRate=" + getAnnualInterestRate()
                + ", overdraftLimit=" + overdraftLimit
                + ", dateCreated=" + getDateCreated()
                + "}";
    }
}
