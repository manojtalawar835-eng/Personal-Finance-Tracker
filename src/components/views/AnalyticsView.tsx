import React, { useState, useEffect } from 'react';
import {
  LineChart,
  TrendingUp,
  Sparkles,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { CashFlowPrediction, Transaction } from '../../types';
import { formatCurrency } from '../../lib/currency';
import { api } from '../../lib/api';

interface AnalyticsViewProps {
  transactions: Transaction[];
  currency: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ transactions, currency }) => {
  const [predictions, setPredictions] = useState<CashFlowPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPredictions() {
      try {
        const data = await api.getPredictiveCashflow();
        setPredictions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPredictions();
  }, []);

  // Summary figures
  const totalIncomeAllTime = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const totalExpensesAllTime = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  const netSavingsAllTime = totalIncomeAllTime - totalExpensesAllTime;

  return (
    <div id="analytics_view_root" className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <LineChart className="w-5 h-5 text-indigo-500" />
            <span>Predictive Cash Flow & Smart Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Forward-looking forecast driven by machine learning trend modeling
          </p>
        </div>
      </div>

      {/* 1. Predictive Cashflow Cards */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Next 3 Months AI Cash Flow Projections
          </h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            Generating predictive models with Gemini AI...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {predictions.map((p, idx) => {
              const net = p.projectedIncome - p.projectedExpenses;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {p.month}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      {Math.round(p.confidenceScore * 100)}% Confidence
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Projected Income</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatCurrency(p.projectedIncome, currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Projected Burn</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                        {formatCurrency(p.projectedExpenses, currency)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-300">Projected Net Surplus:</span>
                      <span className="text-indigo-600 dark:text-indigo-400">
                        +{formatCurrency(net, currency)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed italic">
                      "{p.aiNotes}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Visual Forecasting Curve SVG */}
      <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Income vs Burn Trajectory
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Historical ledger trend paired with 3-month forecast
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <span className="flex items-center space-x-1 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Income</span>
            </span>
            <span className="flex items-center space-x-1 text-rose-500">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Burn</span>
            </span>
            <span className="flex items-center space-x-1 text-indigo-500">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>Net Savings</span>
            </span>
          </div>
        </div>

        <div className="h-60 w-full pt-4">
          <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
            {/* Grid lines */}
            <line x1="40" y1="30" x2="580" y2="30" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />
            <line x1="40" y1="80" x2="580" y2="80" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />
            <line x1="40" y1="130" x2="580" y2="130" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />
            <line x1="40" y1="180" x2="580" y2="180" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />

            {/* Income line */}
            <path
              d="M 60 80 Q 180 50, 300 45 T 540 35"
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
            />
            {/* Expense line */}
            <path
              d="M 60 140 Q 180 135, 300 130 T 540 120"
              fill="none"
              stroke="#F43F5E"
              strokeWidth="3"
            />
            {/* Net savings line */}
            <path
              d="M 60 160 Q 180 140, 300 120 T 540 95"
              fill="none"
              stroke="#6366F1"
              strokeWidth="2.5"
              strokeDasharray="4 4"
            />

            {/* Points & Labels */}
            <circle cx="60" cy="80" r="4" fill="#10B981" />
            <text x="60" y="195" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">Aug</text>

            <circle cx="180" cy="50" r="4" fill="#10B981" />
            <text x="180" y="195" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">Sep (Now)</text>

            <circle cx="300" cy="45" r="4" fill="#10B981" />
            <text x="300" y="195" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">Oct (Proj)</text>

            <circle cx="420" cy="40" r="4" fill="#10B981" />
            <text x="420" y="195" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">Nov (Proj)</text>

            <circle cx="540" cy="35" r="4" fill="#10B981" />
            <text x="540" y="195" textAnchor="middle" className="text-[10px] fill-slate-400 font-medium">Dec (Proj)</text>
          </svg>
        </div>
      </div>

      {/* 3. Financial Statement Breakdown (P&L) */}
      <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Executive Financial Statement
        </h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="py-3 flex items-center justify-between font-semibold">
            <span className="text-slate-600 dark:text-slate-300">Total Recorded Inflows (Gross Income)</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              +{formatCurrency(totalIncomeAllTime, currency)}
            </span>
          </div>
          <div className="py-3 flex items-center justify-between font-semibold">
            <span className="text-slate-600 dark:text-slate-300">Total Recorded Outflows (Operating Expenses)</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold text-sm">
              -{formatCurrency(totalExpensesAllTime, currency)}
            </span>
          </div>
          <div className="py-3 flex items-center justify-between font-bold bg-slate-50 dark:bg-slate-850 px-3 rounded-xl mt-2">
            <span className="text-slate-900 dark:text-white">Net Accumulated Wealth Created</span>
            <span className="text-indigo-600 dark:text-indigo-400 text-base">
              {formatCurrency(netSavingsAllTime, currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
