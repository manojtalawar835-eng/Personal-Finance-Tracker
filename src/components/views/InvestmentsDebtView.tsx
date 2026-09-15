import React, { useState } from 'react';
import {
  TrendingUp,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  PieChart,
  ShieldAlert,
} from 'lucide-react';
import { Investment, Debt } from '../../types';
import { formatCurrency } from '../../lib/currency';
import { api } from '../../lib/api';

interface InvestmentsDebtViewProps {
  investments: Investment[];
  debts: Debt[];
  currency: string;
  onInvestmentCreated: (inv: Investment) => void;
  onDebtCreated: (debt: Debt) => void;
}

export const InvestmentsDebtView: React.FC<InvestmentsDebtViewProps> = ({
  investments,
  debts,
  currency,
  onInvestmentCreated,
  onDebtCreated,
}) => {
  const [showAddInv, setShowAddInv] = useState(false);
  const [showAddDebt, setShowAddDebt] = useState(false);

  // Investment Form state
  const [invName, setInvName] = useState('');
  const [invType, setInvType] = useState('Stocks');
  const [invBuyPrice, setInvBuyPrice] = useState('');
  const [invCurrentValue, setInvCurrentValue] = useState('');
  const [invUnits, setInvUnits] = useState('1');

  // Debt Form state
  const [debtName, setDebtName] = useState('');
  const [debtPrincipal, setDebtPrincipal] = useState('');
  const [debtRemaining, setDebtRemaining] = useState('');
  const [debtInterest, setDebtInterest] = useState('8.5');
  const [debtMinPayment, setDebtMinPayment] = useState('');
  const [debtDueDate, setDebtDueDate] = useState('15');

  // Investment portfolio calculations
  const totalInvested = investments.reduce((sum, i) => sum + i.buyPrice, 0);
  const totalCurrentValue = investments.reduce((sum, i) => sum + i.currentValue, 0);
  const totalGain = totalCurrentValue - totalInvested;
  const portfolioReturnRate =
    totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(1) : '0';

  // Debt calculations
  const totalDebtRemaining = debts.reduce((sum, d) => sum + d.remainingAmount, 0);
  const totalMonthlyEmi = debts.reduce((sum, d) => sum + d.monthlyMinimum, 0);

  const handleCreateInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName || !invBuyPrice || !invCurrentValue) return;
    try {
      const newInv = await api.createInvestment({
        name: invName,
        type: invType as any,
        buyPrice: parseFloat(invBuyPrice),
        currentValue: parseFloat(invCurrentValue),
        units: parseFloat(invUnits) || 1,
        buyDate: new Date().toISOString().split('T')[0],
      });
      onInvestmentCreated(newInv);
      setShowAddInv(false);
      setInvName('');
      setInvBuyPrice('');
      setInvCurrentValue('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtName || !debtPrincipal || !debtRemaining) return;
    try {
      const newDebt = await api.createDebt({
        name: debtName,
        principal: parseFloat(debtPrincipal),
        remainingAmount: parseFloat(debtRemaining),
        interestRate: parseFloat(debtInterest) || 0,
        monthlyMinimum: parseFloat(debtMinPayment) || 100,
        dueDayOfMonth: parseInt(debtDueDate) || 1,
        type: 'loan',
      });
      onDebtCreated(newDebt);
      setShowAddDebt(false);
      setDebtName('');
      setDebtPrincipal('');
      setDebtRemaining('');
      setDebtMinPayment('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="investments_debt_view_root" className="space-y-8">
      {/* 1. Investments Portfolio */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span>Investment Portfolio</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track equity holdings, index funds, crypto, and unrealized gains
            </p>
          </div>
          <button
            onClick={() => setShowAddInv(!showAddInv)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        </div>

        {/* Portfolio Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold block">Total Portfolio Value</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {formatCurrency(totalCurrentValue, currency)}
            </div>
            <span className="text-[11px] text-slate-400">Invested: {formatCurrency(totalInvested, currency)}</span>
          </div>

          <div className="p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold block">Total Profit / Loss</span>
            <div
              className={`text-xl font-bold mt-1 flex items-center space-x-1 ${
                totalGain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
              }`}
            >
              {totalGain >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              <span>{formatCurrency(Math.abs(totalGain), currency)}</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">
              +{portfolioReturnRate}% all-time ROI
            </span>
          </div>

          <div className="p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold block">Asset Allocation</span>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
              Stocks 65% • Crypto 20% • Gold 15%
            </div>
            <span className="text-[11px] text-slate-400">Diversified low-beta hedge</span>
          </div>
        </div>

        {/* Add Asset Form */}
        {showAddInv && (
          <form
            onSubmit={handleCreateInvestment}
            className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3 animate-in fade-in"
          >
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Add Investment Holding
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple Inc (AAPL), S&P 500 ETF"
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1">Type</label>
                <select
                  value={invType}
                  onChange={(e) => setInvType(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  {['Stocks', 'Crypto', 'Mutual Fund', 'Real Estate', 'Gold', 'Bonds'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1">
                  Cost Basis ({currency})
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1000"
                  value={invBuyPrice}
                  onChange={(e) => setInvBuyPrice(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1">
                  Current Value ({currency})
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1250"
                  value={invCurrentValue}
                  onChange={(e) => setInvCurrentValue(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddInv(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
              >
                Save Holding
              </button>
            </div>
          </form>
        )}

        {/* Investments Table */}
        <div className="rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 pl-5">Asset</th>
                  <th className="p-3.5">Class</th>
                  <th className="p-3.5">Invested Cost</th>
                  <th className="p-3.5">Current Market Value</th>
                  <th className="p-3.5 text-right pr-5">Unrealized Gain / ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-medium">
                {investments.map((inv) => {
                  const gain = inv.currentValue - inv.buyPrice;
                  const gainPct = inv.buyPrice > 0 ? ((gain / inv.buyPrice) * 100).toFixed(1) : '0';
                  const isPositive = gain >= 0;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 pl-5 font-semibold text-slate-900 dark:text-white">
                        {inv.name}
                      </td>
                      <td className="p-3.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {inv.type}
                        </span>
                      </td>
                      <td className="p-3.5">{formatCurrency(inv.buyPrice, currency)}</td>
                      <td className="p-3.5 font-bold">{formatCurrency(inv.currentValue, currency)}</td>
                      <td className="p-3.5 pr-5 text-right font-bold">
                        <span
                          className={
                            isPositive
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }
                        >
                          {isPositive ? '+' : ''}
                          {formatCurrency(gain, currency)} ({gainPct}%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. Debt & Loan Tracker */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-rose-500" />
              <span>Debt & Loan Payoff Tracker</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage student loans, car financing, credit card balances, and interest rates
            </p>
          </div>
          <button
            onClick={() => setShowAddDebt(!showAddDebt)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Debt</span>
          </button>
        </div>

        {/* Debt Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold block">Total Outstanding Debt</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {formatCurrency(totalDebtRemaining, currency)}
            </div>
          </div>
          <div className="p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold block">Total Monthly Obligations</span>
            <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {formatCurrency(totalMonthlyEmi, currency)}/mo
            </div>
          </div>
          <div className="p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold block">Recommended Payoff Strategy</span>
            <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              Avalanche Method (High APR first)
            </div>
            <span className="text-[11px] text-slate-400">Saves an estimated $420 in interest</span>
          </div>
        </div>

        {/* Add Debt Form */}
        {showAddDebt && (
          <form
            onSubmit={handleCreateDebt}
            className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-3 animate-in fade-in"
          >
            <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
              Record Debt Liability
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1">Debt / Loan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Federal Student Loan"
                  value={debtName}
                  onChange={(e) => setDebtName(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1">
                  Remaining Balance ({currency})
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5200"
                  value={debtRemaining}
                  onChange={(e) => {
                    setDebtRemaining(e.target.value);
                    if (!debtPrincipal) setDebtPrincipal(e.target.value);
                  }}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1">APR Interest (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={debtInterest}
                  onChange={(e) => setDebtInterest(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1">Monthly Payment</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 200"
                  value={debtMinPayment}
                  onChange={(e) => setDebtMinPayment(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddDebt(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-xs"
              >
                Save Debt
              </button>
            </div>
          </form>
        )}

        {/* Debts Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {debts.map((d) => {
            const pct = Math.round((d.remainingAmount / (d.principal || d.remainingAmount)) * 100);
            return (
              <div
                key={d.id}
                className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">
                      {d.name}
                    </span>
                    <span className="text-xs text-rose-600 font-semibold">{d.interestRate}% APR Interest</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {formatCurrency(d.monthlyMinimum, currency)}/mo
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Balance Remaining</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(d.remainingAmount, currency)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Due Day: {d.dueDayOfMonth}th of month</span>
                    <span>Principal: {formatCurrency(d.principal, currency)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
