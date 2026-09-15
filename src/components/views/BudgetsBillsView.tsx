import React, { useState } from 'react';
import {
  PieChart,
  Plus,
  AlertCircle,
  CheckCircle2,
  Calendar,
  CreditCard,
  Sparkles,
  DollarSign,
  Clock,
  Trash2,
} from 'lucide-react';
import { Budget, Bill, Transaction } from '../../types';
import { formatCurrency } from '../../lib/currency';
import { api } from '../../lib/api';

interface BudgetsBillsViewProps {
  budgets: Budget[];
  bills: Bill[];
  transactions: Transaction[];
  currency: string;
  onBudgetCreated: (budget: Budget) => void;
  onBudgetDeleted: (id: string) => void;
  onBillCreated: (bill: Bill) => void;
  onPayBill: (billId: string) => void;
  detectedSubscriptions?: { name: string; estimatedAmount: number; frequency: string; category: string }[];
}

export const BudgetsBillsView: React.FC<BudgetsBillsViewProps> = ({
  budgets,
  bills,
  transactions,
  currency,
  onBudgetCreated,
  onBudgetDeleted,
  onBillCreated,
  onPayBill,
  detectedSubscriptions = [],
}) => {
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddBill, setShowAddBill] = useState(false);

  // New budget form state
  const [category, setCategory] = useState('Food & Dining');
  const [limitAmount, setLimitAmount] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('80');

  // New bill form state
  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState('');
  const [billCategory, setBillCategory] = useState('Utilities & Bills');
  const [isEmi, setIsEmi] = useState(false);
  const [autoPay, setAutoPay] = useState(true);

  // Calculate actual spending in current month for each budget category
  const currentMonth = '2026-09';
  const monthExpenses = transactions.filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth));

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!limitAmount) return;
    try {
      const newB = await api.createBudget({
        category,
        limitAmount: parseFloat(limitAmount),
        monthYear: currentMonth,
        alertThreshold: parseInt(alertThreshold) || 80,
      });
      onBudgetCreated(newB);
      setShowAddBudget(false);
      setLimitAmount('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billName || !billAmount || !billDueDate) return;
    try {
      const newB = await api.createBill({
        name: billName,
        amount: parseFloat(billAmount),
        dueDate: billDueDate,
        category: billCategory,
        frequency: 'monthly',
        isEmi,
        autoPay,
      });
      onBillCreated(newB);
      setShowAddBill(false);
      setBillName('');
      setBillAmount('');
      setBillDueDate('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="budgets_bills_view_root" className="space-y-8">
      {/* 1. Budgets Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-emerald-500" />
              <span>Monthly Category Budgets</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set spending thresholds with automated overage alerts
            </p>
          </div>
          <button
            onClick={() => setShowAddBudget(!showAddBudget)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Set New Budget</span>
          </button>
        </div>

        {/* Add Budget Inline Drawer */}
        {showAddBudget && (
          <form
            onSubmit={handleCreateBudget}
            className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3 animate-in fade-in"
          >
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Define Category Spending Limit
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  {[
                    'Housing & Rent',
                    'Food & Dining',
                    'Groceries',
                    'Transportation',
                    'Utilities & Bills',
                    'Entertainment',
                    'Shopping',
                    'Healthcare & Fitness',
                    'Personal Care',
                    'Other Expense',
                  ].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1">
                  Monthly Limit ({currency})
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 500"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1">
                  Warning Alert Threshold (%)
                </label>
                <input
                  type="number"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddBudget(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
              >
                Save Budget
              </button>
            </div>
          </form>
        )}

        {/* Budgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => {
            const spent = monthExpenses
              .filter((t) => t.category === b.category)
              .reduce((s, t) => s + t.amount, 0);
            const percentage = Math.min(150, Math.round((spent / b.limitAmount) * 100));
            const isExceeded = spent > b.limitAmount;
            const isWarning = percentage >= b.alertThreshold && !isExceeded;

            return (
              <div
                key={b.id}
                className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {b.category}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {isExceeded ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        Over Budget
                      </span>
                    ) : isWarning ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Near Cap ({percentage}%)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        On Track
                      </span>
                    )}
                    <button
                      onClick={() => onBudgetDeleted(b.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                      title="Delete budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Spent vs Cap</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(spent, currency)} / {formatCurrency(b.limitAmount, currency)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isExceeded
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>{percentage}% utilized</span>
                    <span>
                      {isExceeded
                        ? `Exceeded by ${formatCurrency(spent - b.limitAmount, currency)}`
                        : `${formatCurrency(b.limitAmount - spent, currency)} left`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Bills & Recurring EMI Reminders */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-indigo-500" />
              <span>Recurring Bills & EMI Reminders</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Never miss a loan installment, utility bill, or subscription payment
            </p>
          </div>
          <button
            onClick={() => setShowAddBill(!showAddBill)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bill / EMI</span>
          </button>
        </div>

        {/* Add Bill Form */}
        {showAddBill && (
          <form
            onSubmit={handleCreateBill}
            className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-3 animate-in fade-in"
          >
            <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300">
              Create New Recurring Payment Reminder
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1">Bill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Car Loan EMI, Fiber Internet"
                  value={billName}
                  onChange={(e) => setBillName(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1">
                  Amount ({currency})
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 150"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={billDueDate}
                  onChange={(e) => setBillDueDate(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4 pt-1">
              <label className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEmi}
                  onChange={(e) => setIsEmi(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <span>Is EMI / Loan Installment</span>
              </label>
              <label className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPay}
                  onChange={(e) => setAutoPay(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <span>Enabled for Auto-Debit / Autopay</span>
              </label>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddBill(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
              >
                Add Bill
              </button>
            </div>
          </form>
        )}

        {/* Bills Table / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bills.map((bill) => (
            <div
              key={bill.id}
              className={`p-4 rounded-2xl border transition-all ${
                bill.status === 'paid'
                  ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {bill.name}
                    </span>
                    {bill.isEmi && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        Loan EMI
                      </span>
                    )}
                    {bill.autoPay && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Autopay
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 mr-0.5" /> Due: {bill.dueDate}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{bill.frequency}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {formatCurrency(bill.amount, currency)}
                  </div>
                  <div className="mt-2">
                    {bill.status === 'paid' ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" /> Paid
                      </span>
                    ) : (
                      <button
                        onClick={() => onPayBill(bill.id)}
                        className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all"
                      >
                        Pay Bill
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. AI Detected Subscriptions */}
      {detectedSubscriptions.length > 0 && (
        <div className="p-5 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/20 space-y-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              AI Smart Subscription Detector
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Our AI analyzed your historical expense ledger and detected recurring subscriptions:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {detectedSubscriptions.map((sub, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    {sub.name}
                  </span>
                  <span className="text-slate-400 text-[10px]">{sub.category}</span>
                </div>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(sub.estimatedAmount, currency)}/mo
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
