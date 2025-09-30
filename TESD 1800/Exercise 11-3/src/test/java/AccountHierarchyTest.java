import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

import java.util.Date;

public class AccountHierarchyTest {

    @Test
    void testAccountDepositWithdraw() {
        Account account = new Account(1001, 1000.0);
        account.deposit(500.0);
        assertEquals(1500.0, account.getBalance(), "Deposit failed");

        account.withdraw(300.0);
        assertEquals(1200.0, account.getBalance(), "Withdraw failed");
    }

    @Test
    void testAccountInterest() {
        Account account = new Account(1001, 1200.0);
        account.setAnnualInterestRate(6.0);
        assertEquals(6.0 / 12 / 100, account.getMonthlyInterestRate(), "Monthly interest rate incorrect");
        assertEquals(6.0, account.getMonthlyInterest(), "Monthly interest incorrect");
    }

    @Test
    void testSavingsAccountNoOverdraft() {
        SavingsAccount savings = new SavingsAccount(2001, 500.0);
        savings.deposit(100.0);
        assertEquals(600.0, savings.getBalance(), "Deposit failed");

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            savings.withdraw(700.0);
        });
        assertEquals("Savings cannot be overdrawn.", exception.getMessage(), "Overdraft rule failed");
    }

    @Test
    void testCheckingAccountOverdraft() {
        CheckingAccount checking = new CheckingAccount(3001, 200.0, 500.0);
        checking.deposit(50.0);
        assertEquals(250.0, checking.getBalance(), "Deposit failed");

        checking.withdraw(600.0);
        assertEquals(-350.0, checking.getBalance(), "Overdraft failed");

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            checking.withdraw(400.0);
        });
        assertEquals("Overdraft limit exceeded.", exception.getMessage(), "Overdraft limit rule failed");
    }

    @Test
    void testToStringMethods() {
        Account account = new Account(1001, 1000.0);
        assertTrue(account.toString().contains("Account"), "Account toString missing class name");

        SavingsAccount savings = new SavingsAccount(2001, 500.0);
        assertTrue(savings.toString().contains("SavingsAccount"), "SavingsAccount toString missing class name");

        CheckingAccount checking = new CheckingAccount(3001, 200.0, 500.0);
        assertTrue(checking.toString().contains("CheckingAccount"), "CheckingAccount toString missing class name");
    }
}