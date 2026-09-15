export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'Housing & Rent'
  | 'Food & Dining'
  | 'Groceries'
  | 'Transportation'
  | 'Utilities & Bills'
  | 'Entertainment'
  | 'Healthcare & Fitness'
  | 'Shopping'
  | 'Education'
  | 'Investments'
  | 'Personal Care'
  | 'Travel'
  | 'Other Expense';

export type IncomeCategory =
  | 'Salary'
  | 'Business'
  | 'Freelance'
  | 'Investments & Dividends'
  | 'Rental Income'
  | 'Bonus'
  | 'Other Income';

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  monthlyIncomeTarget: number;
  monthlyExpenseBudget: number;
  avatarUrl?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  paymentMethod: 'Cash' | 'Credit Card' | 'Debit Card' | 'UPI / Bank Transfer' | 'Net Banking';
  isRecurring?: boolean;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limitAmount: number;
  monthYear: string; // YYYY-MM
  alertThreshold: number; // percentage, e.g., 80
}

export interface SavingsGoal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  monthlyContribution?: number;
  iconName?: string;
  color?: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

export interface Bill {
  id: string;
  userId: string;
  name: string;
  amount: number;
  dueDate: string;
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'one-time';
  category: string;
  status: 'pending' | 'paid' | 'overdue';
  isEmi: boolean;
  autoPay: boolean;
  notes?: string;
}

export interface Investment {
  id: string;
  userId: string;
  assetName: string;
  name?: string;
  assetType: 'stocks' | 'crypto' | 'mutual_funds' | 'gold' | 'bonds' | 'etf' | string;
  type?: string;
  units: number;
  buyPrice: number;
  currentPrice: number;
  currentValue?: number;
  buyDate?: string;
  notes?: string;
  lastUpdated: string;
}

export interface Debt {
  id: string;
  userId: string;
  loanName: string;
  name?: string;
  lender?: string;
  principal?: number;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number; // percentage
  minMonthlyPayment: number;
  monthlyMinimum?: number;
  tenureMonths?: number;
  dueDate?: string;
  dueDayOfMonth?: number;
  type?: string;
}

export interface EmergencyFund {
  id: string;
  userId: string;
  targetAmount: number;
  currentAmount: number;
  monthlyExpenseBenchmark: number;
  monthlyExpenses?: number;
  targetMonths: number;
}

export interface FinancialHealthScore {
  score: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | string;
  summary: string;
  pillars?: {
    savingsRate: { score: number; label: string; details: string };
    budgetDiscipline: { score: number; label: string; details: string };
    debtToIncome: { score: number; label: string; details: string };
    emergencyBuffer: { score: number; label: string; details: string };
  };
  breakdown?: {
    savingsRatio?: number;
    budgetDiscipline?: number;
    emergencyFund?: number;
    debtRatio?: number;
  };
  recommendations: string[];
}

export interface SpendingInsight {
  id: string;
  title: string;
  description: string;
  impactLevel?: 'high' | 'medium' | 'low';
  category?: string;
  actionableStep?: string;
  potentialSavings?: number;
  estimatedSavings?: number;
}

export interface AnomalyItem {
  id: string;
  transactionId?: string;
  description: string;
  amount: number;
  category: string;
  reason: string;
  severity: 'warning' | 'alert';
}

export interface CashFlowPrediction {
  month: string;
  projectedIncome: number;
  projectedExpense: number;
  projectedSavings: number;
  confidence: number;
  keyDrivers: string[];
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  rateAgainstUSD: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
}
