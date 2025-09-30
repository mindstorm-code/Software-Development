public class SavingsAccount extends Account {

    public SavingsAccount() {
        super();
    }

    public SavingsAccount(int accountNumber, double balance) {
        super(accountNumber, balance);
    }

    // Savings cannot be overdrawn
    @Override
    public void withdraw(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Withdrawal must be positive.");
        if (amount > getBalance()) {
            throw new IllegalArgumentException("Savings cannot be overdrawn.");
        }
        setBalance(getBalance() - amount);
    }

    @Override
    public String toString() {
        return "SavingsAccount{"
                + "accountNumber=" + getAccountNumber()
                + ", balance=" + getBalance()
                + ", annualInterestRate=" + getAnnualInterestRate()
                + ", dateCreated=" + getDateCreated()
                + "}";
    }
}
