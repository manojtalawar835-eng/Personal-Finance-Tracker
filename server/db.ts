import bcrypt from 'bcryptjs';
import {
  User,
  Transaction,
  Budget,
  SavingsGoal,
  Bill,
  Investment,
  Debt,
  EmergencyFund,
} from '../src/types';

// In-Memory Relational Database Store that strictly mirrors MySQL schema
export interface DatabaseStore {
  users: Map<string, User & { passwordHash: string }>;
  transactions: Map<string, Transaction>;
  budgets: Map<string, Budget>;
  savingsGoals: Map<string, SavingsGoal>;
  bills: Map<string, Bill>;
  investments: Map<string, Investment>;
  debts: Map<string, Debt>;
  emergencyFunds: Map<string, EmergencyFund>;
}

export const db: DatabaseStore = {
  users: new Map(),
  transactions: new Map(),
  budgets: new Map(),
  savingsGoals: new Map(),
  bills: new Map(),
  investments: new Map(),
  debts: new Map(),
  emergencyFunds: new Map(),
};

// Seed initial placement-quality portfolio data
export function seedInitialData() {
  if (db.users.size > 0) return;

  const defaultPasswordHash = bcrypt.hashSync('demo1234', 10);
  const demoUserId = 'usr_demo_placement_001';

  const demoUser: User & { passwordHash: string } = {
    id: demoUserId,
    name: 'Alex Morgan',
    email: 'alex.morgan@finance.io',
    currency: 'USD',
    monthlyIncomeTarget: 6500,
    monthlyExpenseBudget: 3800,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T08:00:00.000Z',
    passwordHash: defaultPasswordHash,
  };
  db.users.set(demoUserId, demoUser);

  // Seed Emergency Fund
  const ef: EmergencyFund = {
    id: 'ef_001',
    userId: demoUserId,
    targetAmount: 18000,
    currentAmount: 12450,
    monthlyExpenseBenchmark: 3000,
    targetMonths: 6,
  };
  db.emergencyFunds.set(ef.id, ef);

  // Seed Transactions (Mix of Income and Expense for current and previous month)
  const initialTransactions: Transaction[] = [
    {
      id: 'tx_001',
      userId: demoUserId,
      type: 'income',
      category: 'Salary',
      amount: 5200,
      description: 'Senior Software Engineer Monthly Paycheck',
      date: '2026-09-01',
      paymentMethod: 'UPI / Bank Transfer',
      isRecurring: true,
      notes: 'Direct deposit net pay',
      createdAt: '2026-09-01T09:00:00.000Z',
    },
    {
      id: 'tx_002',
      userId: demoUserId,
      type: 'income',
      category: 'Freelance',
      amount: 1450,
      description: 'Fullstack Web App Advisory Consulting',
      date: '2026-09-08',
      paymentMethod: 'UPI / Bank Transfer',
      isRecurring: false,
      notes: 'Client milestone payout',
      createdAt: '2026-09-08T14:30:00.000Z',
    },
    {
      id: 'tx_003',
      userId: demoUserId,
      type: 'expense',
      category: 'Housing & Rent',
      amount: 1650,
      description: 'Downtown Apartment Monthly Lease',
      date: '2026-09-02',
      paymentMethod: 'Net Banking',
      isRecurring: true,
      notes: 'Rent + maintenance',
      createdAt: '2026-09-02T10:00:00.000Z',
    },
    {
      id: 'tx_004',
      userId: demoUserId,
      type: 'expense',
      category: 'Groceries',
      amount: 245.8,
      description: 'Whole Foods Market Bi-weekly restock',
      date: '2026-09-04',
      paymentMethod: 'Credit Card',
      isRecurring: false,
      notes: 'Organic produce & pantry',
      createdAt: '2026-09-04T17:15:00.000Z',
    },
    {
      id: 'tx_005',
      userId: demoUserId,
      type: 'expense',
      category: 'Utilities & Bills',
      amount: 120,
      description: 'High-speed Fiber Internet & Cloud backup',
      date: '2026-09-05',
      paymentMethod: 'Credit Card',
      isRecurring: true,
      notes: 'Autopay bill',
      createdAt: '2026-09-05T08:20:00.000Z',
    },
    {
      id: 'tx_006',
      userId: demoUserId,
      type: 'expense',
      category: 'Food & Dining',
      amount: 88.5,
      description: 'Artisan Bistro Dinner with Team',
      date: '2026-09-07',
      paymentMethod: 'Credit Card',
      isRecurring: false,
      notes: 'Weekend dinner',
      createdAt: '2026-09-07T21:10:00.000Z',
    },
    {
      id: 'tx_007',
      userId: demoUserId,
      type: 'expense',
      category: 'Transportation',
      amount: 65,
      description: 'Metro pass & Rideshare reload',
      date: '2026-09-09',
      paymentMethod: 'Debit Card',
      isRecurring: true,
      notes: 'Commute expenses',
      createdAt: '2026-09-09T11:00:00.000Z',
    },
    {
      id: 'tx_008',
      userId: demoUserId,
      type: 'expense',
      category: 'Entertainment',
      amount: 22.99,
      description: 'Streaming Subscriptions (Netflix 4K + Spotify)',
      date: '2026-09-10',
      paymentMethod: 'Credit Card',
      isRecurring: true,
      notes: 'Monthly digital services',
      createdAt: '2026-09-10T02:00:00.000Z',
    },
    {
      id: 'tx_009',
      userId: demoUserId,
      type: 'expense',
      category: 'Healthcare & Fitness',
      amount: 95,
      description: 'Equinox Gym & Wellness Club Membership',
      date: '2026-09-11',
      paymentMethod: 'Credit Card',
      isRecurring: true,
      notes: 'Gym subscription',
      createdAt: '2026-09-11T07:45:00.000Z',
    },
    {
      id: 'tx_010',
      userId: demoUserId,
      type: 'expense',
      category: 'Shopping',
      amount: 340,
      description: 'Ergonomic Standing Desk Dual Monitor Arm',
      date: '2026-09-12',
      paymentMethod: 'Credit Card',
      isRecurring: false,
      notes: 'Home office equipment',
      createdAt: '2026-09-12T15:30:00.000Z',
    },
    {
      id: 'tx_011',
      userId: demoUserId,
      type: 'expense',
      category: 'Food & Dining',
      amount: 45,
      description: 'Espresso Bar Coffee & Snacks',
      date: '2026-09-14',
      paymentMethod: 'Cash',
      isRecurring: false,
      notes: 'Work café sessions',
      createdAt: '2026-09-14T16:00:00.000Z',
    },
    // Past month comparison data
    {
      id: 'tx_012',
      userId: demoUserId,
      type: 'income',
      category: 'Salary',
      amount: 5200,
      description: 'August Salary Paycheck',
      date: '2026-08-01',
      paymentMethod: 'UPI / Bank Transfer',
      isRecurring: true,
      createdAt: '2026-08-01T09:00:00.000Z',
    },
    {
      id: 'tx_013',
      userId: demoUserId,
      type: 'expense',
      category: 'Housing & Rent',
      amount: 1650,
      description: 'August Rent',
      date: '2026-08-02',
      paymentMethod: 'Net Banking',
      isRecurring: true,
      createdAt: '2026-08-02T10:00:00.000Z',
    },
    {
      id: 'tx_014',
      userId: demoUserId,
      type: 'expense',
      category: 'Groceries',
      amount: 580,
      description: 'August Groceries Aggregated',
      date: '2026-08-20',
      paymentMethod: 'Credit Card',
      isRecurring: false,
      createdAt: '2026-08-20T18:00:00.000Z',
    },
    {
      id: 'tx_015',
      userId: demoUserId,
      type: 'expense',
      category: 'Food & Dining',
      amount: 410,
      description: 'August Dining Out & Takeouts',
      date: '2026-08-25',
      paymentMethod: 'Credit Card',
      isRecurring: false,
      createdAt: '2026-08-25T20:00:00.000Z',
    },
  ];

  for (const t of initialTransactions) {
    db.transactions.set(t.id, t);
  }

  // Seed Budgets
  const initialBudgets: Budget[] = [
    {
      id: 'bgt_001',
      userId: demoUserId,
      category: 'Housing & Rent',
      limitAmount: 1700,
      monthYear: '2026-09',
      alertThreshold: 90,
    },
    {
      id: 'bgt_002',
      userId: demoUserId,
      category: 'Food & Dining',
      limitAmount: 350,
      monthYear: '2026-09',
      alertThreshold: 80,
    },
    {
      id: 'bgt_003',
      userId: demoUserId,
      category: 'Groceries',
      limitAmount: 500,
      monthYear: '2026-09',
      alertThreshold: 80,
    },
    {
      id: 'bgt_004',
      userId: demoUserId,
      category: 'Transportation',
      limitAmount: 180,
      monthYear: '2026-09',
      alertThreshold: 75,
    },
    {
      id: 'bgt_005',
      userId: demoUserId,
      category: 'Shopping',
      limitAmount: 400,
      monthYear: '2026-09',
      alertThreshold: 85,
    },
    {
      id: 'bgt_006',
      userId: demoUserId,
      category: 'Entertainment',
      limitAmount: 150,
      monthYear: '2026-09',
      alertThreshold: 80,
    },
  ];

  for (const b of initialBudgets) {
    db.budgets.set(b.id, b);
  }

  // Seed Savings Goals
  const initialGoals: SavingsGoal[] = [
    {
      id: 'goal_001',
      userId: demoUserId,
      title: '6-Month Emergency Safety Fund',
      targetAmount: 18000,
      currentAmount: 12450,
      targetDate: '2026-12-31',
      category: 'Emergency',
      color: '#10B981',
      status: 'active',
      createdAt: '2026-01-10T00:00:00.000Z',
    },
    {
      id: 'goal_002',
      userId: demoUserId,
      title: 'Kyoto & Tokyo Autumn Vacation',
      targetAmount: 4500,
      currentAmount: 3200,
      targetDate: '2026-11-15',
      category: 'Travel',
      color: '#3B82F6',
      status: 'active',
      createdAt: '2026-03-01T00:00:00.000Z',
    },
    {
      id: 'goal_003',
      userId: demoUserId,
      title: 'Electric Vehicle Downpayment',
      targetAmount: 12000,
      currentAmount: 5500,
      targetDate: '2027-06-30',
      category: 'Vehicle',
      color: '#8B5CF6',
      status: 'active',
      createdAt: '2026-02-15T00:00:00.000Z',
    },
  ];

  for (const g of initialGoals) {
    db.savingsGoals.set(g.id, g);
  }

  // Seed Bills & Subscriptions
  const initialBills: Bill[] = [
    {
      id: 'bill_001',
      userId: demoUserId,
      name: 'Apartment Rent & Maintenance',
      amount: 1650,
      dueDate: '2026-10-01',
      frequency: 'monthly',
      category: 'Housing & Rent',
      status: 'pending',
      isEmi: false,
      autoPay: true,
      notes: 'Billed on 1st of every month',
    },
    {
      id: 'bill_002',
      userId: demoUserId,
      name: 'Education Loan EMI',
      amount: 320,
      dueDate: '2026-09-22',
      frequency: 'monthly',
      category: 'Education',
      status: 'pending',
      isEmi: true,
      autoPay: true,
      notes: 'Federal student loan autopay',
    },
    {
      id: 'bill_003',
      userId: demoUserId,
      name: 'Gigabit Fiber Internet',
      amount: 85,
      dueDate: '2026-09-25',
      frequency: 'monthly',
      category: 'Utilities & Bills',
      status: 'pending',
      isEmi: false,
      autoPay: true,
      notes: 'ISP auto-debit',
    },
    {
      id: 'bill_004',
      userId: demoUserId,
      name: 'Netflix & Spotify Family',
      amount: 28.99,
      dueDate: '2026-09-18',
      frequency: 'monthly',
      category: 'Entertainment',
      status: 'pending',
      isEmi: false,
      autoPay: true,
      notes: 'Streaming services',
    },
  ];

  for (const bl of initialBills) {
    db.bills.set(bl.id, bl);
  }

  // Seed Investments
  const initialInvestments: Investment[] = [
    {
      id: 'inv_001',
      userId: demoUserId,
      assetName: 'Vanguard S&P 500 ETF (VOO)',
      assetType: 'etf',
      units: 24,
      buyPrice: 420.5,
      currentPrice: 485.2,
      notes: 'Core long-term index allocation',
      lastUpdated: '2026-09-15T09:00:00.000Z',
    },
    {
      id: 'inv_002',
      userId: demoUserId,
      assetName: 'NVIDIA Corp (NVDA)',
      assetType: 'stocks',
      units: 40,
      buyPrice: 95.0,
      currentPrice: 138.4,
      notes: 'AI Infrastructure growth stock',
      lastUpdated: '2026-09-15T09:00:00.000Z',
    },
    {
      id: 'inv_003',
      userId: demoUserId,
      assetName: 'Ethereum (ETH)',
      assetType: 'crypto',
      units: 2.5,
      buyPrice: 2800,
      currentPrice: 3450,
      notes: 'Decentralized crypto reserve',
      lastUpdated: '2026-09-15T09:00:00.000Z',
    },
    {
      id: 'inv_004',
      userId: demoUserId,
      assetName: 'HDFC Focused Equity Fund',
      assetType: 'mutual_funds',
      units: 850,
      buyPrice: 14.2,
      currentPrice: 17.8,
      notes: 'SIP diversified bluechip allocation',
      lastUpdated: '2026-09-15T09:00:00.000Z',
    },
  ];

  for (const inv of initialInvestments) {
    db.investments.set(inv.id, inv);
  }

  // Seed Debts / Loans
  const initialDebts: Debt[] = [
    {
      id: 'debt_001',
      userId: demoUserId,
      loanName: 'Higher Education Master Loan',
      lender: 'National Education Credit',
      totalAmount: 24000,
      remainingAmount: 11200,
      interestRate: 4.8,
      minMonthlyPayment: 320,
      tenureMonths: 36,
      dueDate: '2026-09-22',
    },
    {
      id: 'debt_002',
      userId: demoUserId,
      loanName: 'Automobile Loan (Hybrid Sedan)',
      lender: 'Prime Auto Finance',
      totalAmount: 18000,
      remainingAmount: 6400,
      interestRate: 5.4,
      minMonthlyPayment: 380,
      tenureMonths: 18,
      dueDate: '2026-09-28',
    },
  ];

  for (const d of initialDebts) {
    db.debts.set(d.id, d);
  }
}

// Generate complete production MySQL Schema DDL script with relations, indexes, and sample inserts
export function generateMySQLSchemaScript(): string {
  return `-- =========================================================================
-- Personal Finance Tracker - Production Relational MySQL Schema (v2.4)
-- Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- Designed for Placement / Architecture Portfolio Showcase
-- =========================================================================

CREATE DATABASE IF NOT EXISTS personal_finance_db
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE personal_finance_db;

-- 1. Users Table (Core Identity & Settings)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    monthly_income_target DECIMAL(12, 2) DEFAULT 0.00,
    monthly_expense_budget DECIMAL(12, 2) DEFAULT 0.00,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- 2. Transactions Table (Incomes & Expenses Ledger)
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    category VARCHAR(60) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Cash',
    is_recurring BOOLEAN DEFAULT FALSE,
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tx_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_tx_user_date (user_id, date),
    INDEX idx_tx_category (category),
    INDEX idx_tx_type (type)
) ENGINE=InnoDB;

-- 3. Monthly Budgets Table (Category Caps & Alerts)
CREATE TABLE IF NOT EXISTS budgets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    category VARCHAR(60) NOT NULL,
    limit_amount DECIMAL(12, 2) NOT NULL,
    month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    alert_threshold INT DEFAULT 80, -- Trigger alert at 80%
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_budget_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_category_month (user_id, category, month_year)
) ENGINE=InnoDB;

-- 4. Savings Goals Table (Target-driven funds with progress milestones)
CREATE TABLE IF NOT EXISTS savings_goals (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(120) NOT NULL,
    target_amount DECIMAL(12, 2) NOT NULL,
    current_amount DECIMAL(12, 2) DEFAULT 0.00,
    target_date DATE NOT NULL,
    category VARCHAR(60) NOT NULL,
    color VARCHAR(20) DEFAULT '#10B981',
    status ENUM('active', 'completed', 'paused') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_goal_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Recurring Bills & Subscriptions Table (EMI & Due Date Reminders)
CREATE TABLE IF NOT EXISTS bills (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(120) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    frequency ENUM('monthly', 'quarterly', 'yearly', 'one-time') DEFAULT 'monthly',
    category VARCHAR(60) NOT NULL,
    status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
    is_emi BOOLEAN DEFAULT FALSE,
    auto_pay BOOLEAN DEFAULT FALSE,
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bill_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_bills_due (user_id, due_date)
) ENGINE=InnoDB;

-- 6. Investment Portfolio Table (Stocks, Crypto, Mutual Funds, ETFs)
CREATE TABLE IF NOT EXISTS investments (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    asset_name VARCHAR(120) NOT NULL,
    asset_type ENUM('stocks', 'crypto', 'mutual_funds', 'gold', 'bonds', 'etf') NOT NULL,
    units DECIMAL(16, 6) NOT NULL,
    buy_price DECIMAL(12, 2) NOT NULL,
    current_price DECIMAL(12, 2) NOT NULL,
    notes TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inv_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Debts & Loan Payoff Tracker Table (Snowball / Avalanche engine)
CREATE TABLE IF NOT EXISTS debts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    loan_name VARCHAR(120) NOT NULL,
    lender VARCHAR(120) NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    remaining_amount DECIMAL(12, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    min_monthly_payment DECIMAL(12, 2) NOT NULL,
    tenure_months INT NOT NULL,
    due_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_debt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Emergency Fund Benchmark Table
CREATE TABLE IF NOT EXISTS emergency_funds (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    target_amount DECIMAL(12, 2) NOT NULL,
    current_amount DECIMAL(12, 2) NOT NULL,
    monthly_expense_benchmark DECIMAL(12, 2) NOT NULL,
    target_months INT DEFAULT 6,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ef_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Financial Analytics Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    action VARCHAR(50) NOT NULL,
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_user (user_id, created_at)
) ENGINE=InnoDB;
`;
}
