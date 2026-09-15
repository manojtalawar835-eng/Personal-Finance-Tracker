import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  AlertTriangle,
  Sparkles,
  Calendar,
  CreditCard,
  ArrowRight,
  Plus,
  Mic,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';
import {
  Transaction,
  Budget,
  SavingsGoal,
  Bill,
  EmergencyFund,
  FinancialHealthScore,
  SpendingInsight,
  AnomalyItem,
} from '../../types';
import { formatCurrency } from '../../lib/currency';

interface DashboardViewProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  bills: Bill[];
  emergencyFund: EmergencyFund | null;
  healthScore: FinancialHealthScore | null;
  insights: SpendingInsight[];
  anomalies: AnomalyItem[];
  currency: string;
  onOpenAddTransaction: (defaultType?: 'expense' | 'income') => void;
  onOpenVoiceModal: () => void;
  onPayBill: (billId: string) => void;
  onNavigateTab: (tab: any) => void;
  isDarkMode: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  budgets,
  goals,
  bills,
  emergencyFund,
  healthScore,
  insights,
  anomalies,
  currency,
  onOpenAddTransaction,
  onOpenVoiceModal,
  onPayBill,
  onNavigateTab,
  isDarkMode,
}) => {
  // Current month calculation
  const currentMonth = '2026-09';
  const monthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth));
  const currentIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const currentExpense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = Math.max(0, currentIncome - currentExpense);
  const savingsRate = currentIncome > 0 ? Math.round((netSavings / currentIncome) * 100) : 0;

  // Total balance calculation
  const allIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const allExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netCashBalance = allIncome - allExpense;

  // Category breakdown for expenses
  const categoryTotals: Record<string, number> = {};
  monthTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'];

  // Upcoming pending bills
  const pendingBills = bills.filter((b) => b.status === 'pending');

  return (
    <div id="dashboard_view_root" className="space-y-6">
      {/* AI Anomaly / Alert Banner if present */}
      {anomalies.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                AI Unusual Spending Detection
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                {anomalies[0].description}: {formatCurrency(anomalies[0].amount, currency)} —{' '}
                {anomalies[0].reason}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('ai-advisor')}
            className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center space-x-1 shrink-0"
          >
            <span>Review Insights</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Cash Balance */}
        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Net Liquid Balance
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {formatCurrency(netCashBalance, currency)}
            </div>
            <div className="flex items-center space-x-1 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Healthy cash reserve</span>
            </div>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              September Income
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {formatCurrency(currentIncome, currency)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              From salary + consulting
            </div>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              September Expenses
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {formatCurrency(currentExpense, currency)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Under monthly budget limit
            </div>
          </div>
        </div>

        {/* Monthly Savings Rate */}
        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Net Savings Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {savingsRate}%
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">
              +{formatCurrency(netSavings, currency)} retained
            </div>
          </div>
        </div>
      </div>

      {/* Action Quick Bar */}
      <div className="p-3 rounded-2xl border bg-slate-50 dark:bg-slate-850 dark:border-slate-800 border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            id="quick_btn_expense"
            onClick={() => onOpenAddTransaction('expense')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
          <button
            id="quick_btn_income"
            onClick={() => onOpenAddTransaction('income')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Income</span>
          </button>
          <button
            id="quick_btn_voice"
            onClick={onOpenVoiceModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Record</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigateTab('ai-advisor')}
            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/20 flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span>AI Advisor ({healthScore?.score || 88}/100)</span>
          </button>
        </div>
      </div>

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Comparison (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Monthly Income vs Spending
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                August vs September cash balance movement
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-semibold">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400">Income</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-slate-600 dark:text-slate-400">Expenses</span>
              </div>
            </div>
          </div>

          {/* Clean High-Performance SVG Chart */}
          <div className="h-56 w-full pt-4">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              {/* Horizontal Grid lines */}
              <line x1="40" y1="30" x2="480" y2="30" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />
              <line x1="40" y1="80" x2="480" y2="80" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />
              <line x1="40" y1="130" x2="480" y2="130" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />
              <line x1="40" y1="180" x2="480" y2="180" stroke="currentColor" className="text-slate-200 dark:text-slate-750" />

              {/* Y Axis Labels */}
              <text x="35" y="35" textAnchor="end" className="text-[10px] fill-slate-400">$6k</text>
              <text x="35" y="85" textAnchor="end" className="text-[10px] fill-slate-400">$4k</text>
              <text x="35" y="135" textAnchor="end" className="text-[10px] fill-slate-400">$2k</text>
              <text x="35" y="185" textAnchor="end" className="text-[10px] fill-slate-400">$0</text>

              {/* Month 1: August */}
              {/* Income: $5,200 -> height ratio ~ 130 */}
              <rect x="120" y="50" width="36" height="130" rx="6" fill="#10B981" opacity="0.9" />
              {/* Expense: $2,640 -> height ratio ~ 66 */}
              <rect x="162" y="114" width="36" height="66" rx="6" fill="#F43F5E" opacity="0.9" />
              <text x="160" y="196" textAnchor="middle" className="text-xs font-semibold fill-slate-500">August</text>

              {/* Month 2: September */}
              {/* Income: $6,650 -> height ratio ~ 166 */}
              <rect x="300" y="24" width="36" height="156" rx="6" fill="#10B981" />
              {/* Expense: $2,672 -> height ratio ~ 67 */}
              <rect x="342" y="113" width="36" height="67" rx="6" fill="#F43F5E" />
              <text x="340" y="196" textAnchor="middle" className="text-xs font-semibold fill-slate-500">September (Current)</text>
            </svg>
          </div>
        </div>

        {/* Top Expense Categories Donut (1 col) */}
        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Top Expenses
            </h3>
            <span className="text-xs text-slate-400 font-medium">By Category</span>
          </div>

          <div className="space-y-3 pt-1">
            {sortedCategories.map(([category, amt], index) => {
              const pct = currentExpense > 0 ? Math.round((amt / currentExpense) * 100) : 0;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {category}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(amt, currency)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: colors[index % colors.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dual Widget Row: Recent Transactions & Upcoming Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Recent Transactions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest ledger activities across accounts
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <span>View All ({transactions.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="py-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      t.type === 'income'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {t.type === 'income' ? '+' : '-'}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
                      {t.description}
                    </span>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                      <span>{t.date}</span>
                      <span>•</span>
                      <span>{t.category}</span>
                      <span>•</span>
                      <span>{t.paymentMethod}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-bold text-sm ${
                      t.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {t.type === 'income' ? '+' : '-'}
                    {formatCurrency(t.amount, currency)}
                  </div>
                  {t.isRecurring && (
                    <span className="text-[10px] text-indigo-500 font-semibold">Recurring</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Bills & EMI Tracker (1 col) */}
        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Bills & EMI Alerts
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('budgets')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="space-y-3">
            {pendingBills.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">All bills are up to date!</p>
            ) : (
              pendingBills.slice(0, 4).map((bill) => (
                <div
                  key={bill.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {bill.name}
                      </span>
                      {bill.isEmi && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          EMI
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                      <Clock className="w-3 h-3 mr-0.5" /> Due: {bill.dueDate}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {formatCurrency(bill.amount, currency)}
                    </span>
                    <button
                      onClick={() => onPayBill(bill.id)}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                    >
                      Pay
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
