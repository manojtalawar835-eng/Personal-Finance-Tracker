import {
  User,
  Transaction,
  Budget,
  SavingsGoal,
  Bill,
  Investment,
  Debt,
  EmergencyFund,
  FinancialHealthScore,
  SpendingInsight,
  AnomalyItem,
  CashFlowPrediction,
} from '../types';

const TOKEN_KEY = 'finance_tracker_jwt_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Auth
  async demoLogin(): Promise<{ token: string; user: User }> {
    const data = await fetchWithAuth('/api/auth/demo-login', { method: 'POST' });
    setAuthToken(data.token);
    return data;
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await fetchWithAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(data.token);
    return data;
  },

  async register(userData: Partial<User> & { password: string }): Promise<{ token: string; user: User }> {
    const data = await fetchWithAuth('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    setAuthToken(data.token);
    return data;
  },

  async getProfile(): Promise<User> {
    return fetchWithAuth('/api/auth/profile');
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    return fetchWithAuth('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return fetchWithAuth('/api/transactions');
  },

  async createTransaction(tx: Partial<Transaction>): Promise<Transaction> {
    return fetchWithAuth('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(tx),
    });
  },

  async deleteTransaction(id: string): Promise<{ success: boolean }> {
    return fetchWithAuth(`/api/transactions/${id}`, { method: 'DELETE' });
  },

  async batchImportTransactions(transactions: Partial<Transaction>[]): Promise<{ message: string; importedCount: number }> {
    return fetchWithAuth('/api/transactions/batch-import', {
      method: 'POST',
      body: JSON.stringify({ transactions }),
    });
  },

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    return fetchWithAuth('/api/budgets');
  },

  async createBudget(bgt: Partial<Budget>): Promise<Budget> {
    return fetchWithAuth('/api/budgets', {
      method: 'POST',
      body: JSON.stringify(bgt),
    });
  },

  async deleteBudget(id: string): Promise<{ success: boolean }> {
    return fetchWithAuth(`/api/budgets/${id}`, { method: 'DELETE' });
  },

  // Savings Goals
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    return fetchWithAuth('/api/savings');
  },

  async createSavingsGoal(goal: Partial<SavingsGoal>): Promise<SavingsGoal> {
    return fetchWithAuth('/api/savings', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  },

  async depositToGoal(id: string, amount: number): Promise<SavingsGoal> {
    return fetchWithAuth(`/api/savings/${id}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  // Bills
  async getBills(): Promise<Bill[]> {
    return fetchWithAuth('/api/bills');
  },

  async createBill(bill: Partial<Bill>): Promise<Bill> {
    return fetchWithAuth('/api/bills', {
      method: 'POST',
      body: JSON.stringify(bill),
    });
  },

  async payBill(id: string): Promise<{ success: boolean; bill: Bill }> {
    return fetchWithAuth(`/api/bills/${id}/pay`, { method: 'POST' });
  },

  // Investments
  async getInvestments(): Promise<Investment[]> {
    return fetchWithAuth('/api/investments');
  },

  async createInvestment(inv: Partial<Investment>): Promise<Investment> {
    return fetchWithAuth('/api/investments', {
      method: 'POST',
      body: JSON.stringify(inv),
    });
  },

  // Debts
  async getDebts(): Promise<Debt[]> {
    return fetchWithAuth('/api/debts');
  },

  async createDebt(debt: Partial<Debt>): Promise<Debt> {
    return fetchWithAuth('/api/debts', {
      method: 'POST',
      body: JSON.stringify(debt),
    });
  },

  // Emergency Fund
  async getEmergencyFund(): Promise<EmergencyFund> {
    return fetchWithAuth('/api/emergency-fund');
  },

  async depositEmergencyFund(amount: number): Promise<EmergencyFund> {
    return fetchWithAuth('/api/emergency-fund/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  // AI Services
  async autoCategorize(description: string, amount: number, type: 'income' | 'expense' = 'expense'): Promise<{ category: string; confidence: number }> {
    return fetchWithAuth('/api/ai/categorize', {
      method: 'POST',
      body: JSON.stringify({ description, amount, type }),
    });
  },

  async parseVoiceExpense(speechText: string): Promise<{
    amount: number;
    type: 'expense' | 'income';
    category: string;
    description: string;
    paymentMethod: string;
    date: string;
  }> {
    return fetchWithAuth('/api/ai/voice-parse', {
      method: 'POST',
      body: JSON.stringify({ speechText }),
    });
  },

  async getAiInsights(): Promise<{
    healthScore: FinancialHealthScore;
    insights: SpendingInsight[];
    anomalies: AnomalyItem[];
    detectedSubscriptions: { name: string; estimatedAmount: number; frequency: string; category: string }[];
  }> {
    return fetchWithAuth('/api/ai/insights');
  },

  async getPredictiveCashflow(): Promise<CashFlowPrediction[]> {
    return fetchWithAuth('/api/ai/predict-cashflow');
  },

  async sendChatMessage(message: string, history: any[] = []): Promise<{ reply: string }> {
    return fetchWithAuth('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  },

  // Schema & SQL
  async getMySQLSchema(): Promise<{ databaseEngine: string; tables: string[]; sqlScript: string }> {
    return fetchWithAuth('/api/schema/sql');
  },
};
