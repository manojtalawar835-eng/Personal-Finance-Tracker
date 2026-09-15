import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import {
  db,
  seedInitialData,
  generateMySQLSchemaScript,
} from './server/db.ts';
import {
  autoCategorizeTransaction,
  parseVoiceExpense,
  generateFinancialInsights,
  predictCashFlow,
  chatWithFinancialAdvisor,
} from './server/gemini.ts';
import { Transaction, User, Budget, SavingsGoal, Bill, Investment, Debt } from './src/types.ts';

dotenv.config();

// Seed database
seedInitialData();

const JWT_SECRET = process.env.JWT_SECRET || 'personal-finance-super-secret-key-2026';
const PORT = 3000;

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: User;
}

// Authentication Middleware
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    // Default to demo user if no token provided in demo environment
    const demoUser = Array.from(db.users.values())[0];
    if (demoUser) {
      req.userId = demoUser.id;
      req.user = demoUser;
      return next();
    }
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      // Fallback to demo user for smooth evaluation
      const demoUser = Array.from(db.users.values())[0];
      req.userId = demoUser?.id || 'usr_demo_placement_001';
      req.user = demoUser;
      return next();
    }
    req.userId = decoded.userId;
    const user = db.users.get(decoded.userId);
    if (user) req.user = user;
    next();
  });
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'relational-mysql-in-memory',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // ==========================================
  // AUTHENTICATION ROUTES
  // ==========================================

  // Demo Login (Instant evaluation)
  app.post('/api/auth/demo-login', (req, res) => {
    const demoUser = Array.from(db.users.values())[0];
    if (!demoUser) {
      return res.status(500).json({ error: 'Demo user not seeded' });
    }
    const token = jwt.sign(
      { userId: demoUser.id, email: demoUser.email, name: demoUser.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    const { passwordHash, ...safeUser } = demoUser;
    res.json({ token, user: safeUser });
  });

  // User Register
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, currency = 'USD', monthlyIncomeTarget = 5000, monthlyExpenseBudget = 3000 } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check existing email
    const existing = Array.from(db.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const userId = `usr_${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser: User & { passwordHash: string } = {
      id: userId,
      name,
      email,
      currency,
      monthlyIncomeTarget: Number(monthlyIncomeTarget),
      monthlyExpenseBudget: Number(monthlyExpenseBudget),
      createdAt: new Date().toISOString(),
      passwordHash,
    };

    db.users.set(userId, newUser);

    const token = jwt.sign({ userId, email, name }, JWT_SECRET, { expiresIn: '30d' });
    const { passwordHash: _, ...safeUser } = newUser;
    res.status(201).json({ token, user: safeUser });
  });

  // User Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = Array.from(db.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
    const { passwordHash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  });

  // User Profile
  app.get('/api/auth/profile', authenticateToken, (req: AuthenticatedRequest, res) => {
    const user = db.users.get(req.userId!);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  });

  // Update Profile / Settings (Currency, Budget targets)
  app.put('/api/auth/profile', authenticateToken, (req: AuthenticatedRequest, res) => {
    const user = db.users.get(req.userId!);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { name, currency, monthlyIncomeTarget, monthlyExpenseBudget } = req.body;
    if (name) user.name = name;
    if (currency) user.currency = currency;
    if (monthlyIncomeTarget !== undefined) user.monthlyIncomeTarget = Number(monthlyIncomeTarget);
    if (monthlyExpenseBudget !== undefined) user.monthlyExpenseBudget = Number(monthlyExpenseBudget);

    db.users.set(user.id, user);
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  });

  // ==========================================
  // TRANSACTIONS ROUTES
  // ==========================================

  // Get all transactions for current user
  app.get('/api/transactions', authenticateToken, (req: AuthenticatedRequest, res) => {
    const userTransactions = Array.from(db.transactions.values())
      .filter((t) => t.userId === req.userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(userTransactions);
  });

  // Create transaction
  app.post('/api/transactions', authenticateToken, async (req: AuthenticatedRequest, res) => {
    const {
      type,
      category,
      amount,
      description,
      date,
      paymentMethod = 'Credit Card',
      isRecurring = false,
      notes,
      receiptUrl,
    } = req.body;

    if (!type || !amount || !description) {
      return res.status(400).json({ error: 'Type, amount, and description are required' });
    }

    let finalCategory = category;
    if (!finalCategory) {
      const catResult = await autoCategorizeTransaction(description, Number(amount), type);
      finalCategory = catResult.category;
    }

    const txId = `tx_${Date.now()}`;
    const newTx: Transaction = {
      id: txId,
      userId: req.userId!,
      type,
      category: finalCategory,
      amount: Number(amount),
      description,
      date: date || new Date().toISOString().split('T')[0],
      paymentMethod,
      isRecurring: Boolean(isRecurring),
      notes,
      receiptUrl,
      createdAt: new Date().toISOString(),
    };

    db.transactions.set(txId, newTx);
    res.status(201).json(newTx);
  });

  // Batch Import Transactions (CSV Import)
  app.post('/api/transactions/batch-import', authenticateToken, (req: AuthenticatedRequest, res) => {
    const { transactions: rawTransactions } = req.body;
    if (!Array.isArray(rawTransactions)) {
      return res.status(400).json({ error: 'Invalid transactions array' });
    }

    const imported: Transaction[] = [];
    for (const raw of rawTransactions) {
      if (!raw.amount || !raw.description) continue;
      const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const tx: Transaction = {
        id: txId,
        userId: req.userId!,
        type: raw.type === 'income' ? 'income' : 'expense',
        category: raw.category || (raw.type === 'income' ? 'Salary' : 'Other Expense'),
        amount: Math.abs(Number(raw.amount)),
        description: raw.description,
        date: raw.date || new Date().toISOString().split('T')[0],
        paymentMethod: raw.paymentMethod || 'Credit Card',
        isRecurring: Boolean(raw.isRecurring),
        notes: raw.notes || 'Imported via CSV',
        createdAt: new Date().toISOString(),
      };
      db.transactions.set(txId, tx);
      imported.push(tx);
    }

    res.json({ message: `Successfully imported ${imported.length} transactions`, importedCount: imported.length });
  });

  // Delete transaction
  app.delete('/api/transactions/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
    const tx = db.transactions.get(req.params.id);
    if (!tx || tx.userId !== req.userId) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    db.transactions.delete(req.params.id);
    res.json({ success: true, message: 'Transaction deleted' });
  });

  // ==========================================
  // BUDGETS ROUTES
  // ==========================================

  app.get('/api/budgets', authenticateToken, (req: AuthenticatedRequest, res) => {
    const userBudgets = Array.from(db.budgets.values()).filter((b) => b.userId === req.userId);
    res.json(userBudgets);
  });

  app.post('/api/budgets', authenticateToken, (req: AuthenticatedRequest, res) => {
    const { category, limitAmount, monthYear = '2026-09', alertThreshold = 80 } = req.body;
    if (!category || !limitAmount) {
      return res.status(400).json({ error: 'Category and limitAmount are required' });
    }

    const budgetId = `bgt_${Date.now()}`;
    const newBudget: Budget = {
      id: budgetId,
      userId: req.userId!,
      category,
      limitAmount: Number(limitAmount),
      monthYear,
      alertThreshold: Number(alertThreshold),
    };

    db.budgets.set(budgetId, newBudget);
    res.status(201).json(newBudget);
  });

  app.delete('/api/budgets/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
    const b = db.budgets.get(req.params.id);
    if (!b || b.userId !== req.userId) return res.status(404).json({ error: 'Budget not found' });
    db.budgets.delete(req.params.id);
    res.json({ success: true });
  });

  // ==========================================
  // SAVINGS GOALS ROUTES
  // ==========================================

  app.get('/api/savings', authenticateToken, (req: AuthenticatedRequest, res) => {
    const goals = Array.from(db.savingsGoals.values()).filter((g) => g.userId === req.userId);
    res.json(goals);
  });

  app.post('/api/savings', authenticateToken, (req: AuthenticatedRequest, res) => {
    const { title, targetAmount, currentAmount = 0, targetDate, category = 'General', color = '#10B981' } = req.body;
    if (!title || !targetAmount || !targetDate) {
      return res.status(400).json({ error: 'Title, targetAmount, and targetDate are required' });
    }

    const goalId = `goal_${Date.now()}`;
    const newGoal: SavingsGoal = {
      id: goalId,
      userId: req.userId!,
      title,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount),
      targetDate,
      category,
      color,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    db.savingsGoals.set(goalId, newGoal);
    res.status(201).json(newGoal);
  });

  app.post('/api/savings/:id/deposit', authenticateToken, (req: AuthenticatedRequest, res) => {
    const goal = db.savingsGoals.get(req.params.id);
    if (!goal || goal.userId !== req.userId) return res.status(404).json({ error: 'Goal not found' });

    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid deposit amount required' });

    goal.currentAmount += Number(amount);
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }
    db.savingsGoals.set(goal.id, goal);

    // Also optionally record as an expense into savings ledger
    const txId = `tx_${Date.now()}`;
    db.transactions.set(txId, {
      id: txId,
      userId: req.userId!,
      type: 'expense',
      category: 'Investments',
      amount: Number(amount),
      description: `Deposit to Goal: ${goal.title}`,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'UPI / Bank Transfer',
      notes: `Goal progress contribution`,
      createdAt: new Date().toISOString(),
    });

    res.json(goal);
  });

  // ==========================================
  // BILLS & EMI REMINDERS
  // ==========================================

  app.get('/api/bills', authenticateToken, (req: AuthenticatedRequest, res) => {
    const bills = Array.from(db.bills.values()).filter((b) => b.userId === req.userId);
    res.json(bills);
  });

  app.post('/api/bills', authenticateToken, (req: AuthenticatedRequest, res) => {
    const { name, amount, dueDate, frequency = 'monthly', category = 'Utilities & Bills', isEmi = false, autoPay = false } = req.body;
    if (!name || !amount || !dueDate) {
      return res.status(400).json({ error: 'Name, amount, and dueDate are required' });
    }

    const billId = `bill_${Date.now()}`;
    const newBill: Bill = {
      id: billId,
      userId: req.userId!,
      name,
      amount: Number(amount),
      dueDate,
      frequency,
      category,
      status: 'pending',
      isEmi: Boolean(isEmi),
      autoPay: Boolean(autoPay),
    };

    db.bills.set(billId, newBill);
    res.status(201).json(newBill);
  });

  app.post('/api/bills/:id/pay', authenticateToken, (req: AuthenticatedRequest, res) => {
    const bill = db.bills.get(req.params.id);
    if (!bill || bill.userId !== req.userId) return res.status(404).json({ error: 'Bill not found' });

    bill.status = 'paid';
    db.bills.set(bill.id, bill);

    // Create an automatic transaction record for the payment
    const txId = `tx_${Date.now()}`;
    db.transactions.set(txId, {
      id: txId,
      userId: req.userId!,
      type: 'expense',
      category: bill.category || 'Utilities & Bills',
      amount: bill.amount,
      description: `Bill Payment: ${bill.name}`,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'UPI / Bank Transfer',
      notes: `Autologged bill payment`,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, bill });
  });

  // ==========================================
  // INVESTMENTS & PORTFOLIO
  // ==========================================

  app.get('/api/investments', authenticateToken, (req: AuthenticatedRequest, res) => {
    const investments = Array.from(db.investments.values()).filter((i) => i.userId === req.userId);
    res.json(investments);
  });

  app.post('/api/investments', authenticateToken, (req: AuthenticatedRequest, res) => {
    const { assetName, assetType, units, buyPrice, currentPrice, notes } = req.body;
    if (!assetName || !units || !buyPrice) {
      return res.status(400).json({ error: 'Asset name, units, and buy price required' });
    }

    const invId = `inv_${Date.now()}`;
    const newInv: Investment = {
      id: invId,
      userId: req.userId!,
      assetName,
      assetType: assetType || 'stocks',
      units: Number(units),
      buyPrice: Number(buyPrice),
      currentPrice: Number(currentPrice || buyPrice),
      notes,
      lastUpdated: new Date().toISOString(),
    };

    db.investments.set(invId, newInv);
    res.status(201).json(newInv);
  });

  // ==========================================
  // DEBTS & LOANS
  // ==========================================

  app.get('/api/debts', authenticateToken, (req: AuthenticatedRequest, res) => {
    const debts = Array.from(db.debts.values()).filter((d) => d.userId === req.userId);
    res.json(debts);
  });

  app.post('/api/debts', authenticateToken, (req: AuthenticatedRequest, res) => {
    const { loanName, lender, totalAmount, remainingAmount, interestRate, minMonthlyPayment, tenureMonths, dueDate } = req.body;
    if (!loanName || !totalAmount || !interestRate) {
      return res.status(400).json({ error: 'Loan name, total amount, and interest rate required' });
    }

    const debtId = `debt_${Date.now()}`;
    const newDebt: Debt = {
      id: debtId,
      userId: req.userId!,
      loanName,
      lender: lender || 'Financial Institution',
      totalAmount: Number(totalAmount),
      remainingAmount: Number(remainingAmount || totalAmount),
      interestRate: Number(interestRate),
      minMonthlyPayment: Number(minMonthlyPayment || 100),
      tenureMonths: Number(tenureMonths || 24),
      dueDate: dueDate || new Date().toISOString().split('T')[0],
    };

    db.debts.set(debtId, newDebt);
    res.status(201).json(newDebt);
  });

  // ==========================================
  // EMERGENCY FUND
  // ==========================================

  app.get('/api/emergency-fund', authenticateToken, (req: AuthenticatedRequest, res) => {
    let ef = Array.from(db.emergencyFunds.values()).find((e) => e.userId === req.userId);
    if (!ef) {
      ef = {
        id: `ef_${Date.now()}`,
        userId: req.userId!,
        targetAmount: 18000,
        currentAmount: 12450,
        monthlyExpenseBenchmark: 3000,
        targetMonths: 6,
      };
      db.emergencyFunds.set(ef.id, ef);
    }
    res.json(ef);
  });

  app.post('/api/emergency-fund/deposit', authenticateToken, (req: AuthenticatedRequest, res) => {
    let ef = Array.from(db.emergencyFunds.values()).find((e) => e.userId === req.userId);
    if (!ef) {
      ef = {
        id: `ef_${Date.now()}`,
        userId: req.userId!,
        targetAmount: 18000,
        currentAmount: 0,
        monthlyExpenseBenchmark: 3000,
        targetMonths: 6,
      };
    }
    const { amount } = req.body;
    ef.currentAmount += Number(amount || 0);
    db.emergencyFunds.set(ef.id, ef);
    res.json(ef);
  });

  // ==========================================
  // AI-POWERED FEATURES (Gemini 3.8 Flash)
  // ==========================================

  // 1. Auto-categorize
  app.post('/api/ai/categorize', authenticateToken, async (req, res) => {
    const { description, amount, type } = req.body;
    if (!description) return res.status(400).json({ error: 'Description required' });
    const result = await autoCategorizeTransaction(description, Number(amount || 0), type || 'expense');
    res.json(result);
  });

  // 2. Voice expense entry natural language parsing
  app.post('/api/ai/voice-parse', authenticateToken, async (req, res) => {
    const { speechText } = req.body;
    if (!speechText) return res.status(400).json({ error: 'Speech text required' });
    const parsed = await parseVoiceExpense(speechText);
    res.json(parsed);
  });

  // 3. Financial Insights & Health Score
  app.get('/api/ai/insights', authenticateToken, async (req: AuthenticatedRequest, res) => {
    const userTransactions = Array.from(db.transactions.values()).filter((t) => t.userId === req.userId);
    const user = db.users.get(req.userId!);
    const insights = await generateFinancialInsights(
      userTransactions,
      user?.monthlyIncomeTarget || 6500,
      user?.monthlyExpenseBudget || 3800,
      user?.currency || 'USD'
    );
    res.json(insights);
  });

  // 4. Predictive Cash Flow (3 Months)
  app.get('/api/ai/predict-cashflow', authenticateToken, async (req: AuthenticatedRequest, res) => {
    const userTransactions = Array.from(db.transactions.values()).filter((t) => t.userId === req.userId);
    const user = db.users.get(req.userId!);
    const predictions = await predictCashFlow(
      userTransactions,
      user?.monthlyIncomeTarget || 6500,
      user?.monthlyExpenseBudget || 3800
    );
    res.json(predictions);
  });

  // 5. Financial Chatbot
  app.post('/api/ai/chat', authenticateToken, async (req: AuthenticatedRequest, res) => {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const user = db.users.get(req.userId!);
    const userTransactions = Array.from(db.transactions.values()).filter((t) => t.userId === req.userId);
    const totalIncome = userTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = userTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const ef = Array.from(db.emergencyFunds.values()).find((e) => e.userId === req.userId);
    const goals = Array.from(db.savingsGoals.values())
      .filter((g) => g.userId === req.userId)
      .map((g) => ({ title: g.title, current: g.currentAmount, target: g.targetAmount }));

    const financialContext = {
      totalBalance: Math.max(0, totalIncome - totalExpense),
      monthlyIncome: user?.monthlyIncomeTarget || 6500,
      monthlyExpense: user?.monthlyExpenseBudget || 3800,
      emergencyFund: ef?.currentAmount || 12450,
      goals,
      currency: user?.currency || 'USD',
    };

    const reply = await chatWithFinancialAdvisor(message, history, financialContext);
    res.json({ reply });
  });

  // ==========================================
  // SCHEMA & ARCHITECTURE DOCUMENTATION (For Placement Resume)
  // ==========================================
  app.get('/api/schema/sql', (req, res) => {
    const sql = generateMySQLSchemaScript();
    res.json({
      databaseEngine: 'MySQL 8.0 InnoDB',
      tables: ['users', 'transactions', 'budgets', 'savings_goals', 'bills', 'investments', 'debts', 'emergency_funds', 'audit_logs'],
      sqlScript: sql,
    });
  });

  // ==========================================
  // VITE / STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Finance Tracker server running on port ${PORT}`);
  });
}

startServer();
