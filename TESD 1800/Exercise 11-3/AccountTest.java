public class AccountTest {
    public static void main(String[] args) {
        // Base Account
        Account base = new Account(1001, 1000.00);
        base.setAnnualInterestRate(3.0);
        base.deposit(250.00);
        try {
            base.withdraw(300.00);
        } catch (Exception ex) {
            System.out.println("Base withdraw error: " + ex.getMessage());
        }

        // Savings (no overdraft)
        SavingsAccount sav = new SavingsAccount(2001, 500.00);
        sav.setAnnualInterestRate(2.0);
        sav.deposit(100.00);
        try {
            sav.withdraw(700.00); // should trigger "cannot be overdrawn"
        } catch (Exception ex) {
            System.out.println("Savings withdraw error: " + ex.getMessage());
        }

        // Checking (with overdraft)
        CheckingAccount chk = new CheckingAccount(3001, 200.00, 500.00); // overdraft up to -500
        chk.setAnnualInterestRate(1.5);
        chk.deposit(50.00);
        try {
            chk.withdraw(600.00); // ends with -350 → allowed
            chk.withdraw(400.00); // would go to -750 → exceeds overdraft
        } catch (Exception ex) {
            System.out.println("Checking withdraw error: " + ex.getMessage());
        }

        // Print toString() as required
        System.out.println(base.toString());
        System.out.println(sav.toString());
        System.out.println(chk.toString());
    }
}
