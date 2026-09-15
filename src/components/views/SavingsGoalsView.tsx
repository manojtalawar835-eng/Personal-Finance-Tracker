import React, { useState } from 'react';
import {
  Target,
  Shield,
  Plus,
  TrendingUp,
  DollarSign,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { SavingsGoal, EmergencyFund } from '../../types';
import { formatCurrency } from '../../lib/currency';
import { api } from '../../lib/api';

interface SavingsGoalsViewProps {
  goals: SavingsGoal[];
  emergencyFund: EmergencyFund | null;
  currency: string;
  onGoalCreated: (goal: SavingsGoal) => void;
  onGoalUpdated: (goal: SavingsGoal) => void;
  onEmergencyFundUpdated: (fund: EmergencyFund) => void;
}

export const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({
  goals,
  emergencyFund,
  currency,
  onGoalCreated,
  onGoalUpdated,
  onEmergencyFundUpdated,
}) => {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [showEmergencyDeposit, setShowEmergencyDeposit] = useState(false);
  const [emergencyDepositAmount, setEmergencyDepositAmount] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('Purchase');
  const [monthlyContribution, setMonthlyContribution] = useState('');

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) return;
    try {
      const newGoal = await api.createSavingsGoal({
        title,
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0,
        targetDate: targetDate || '2027-01-01',
        category,
        monthlyContribution: parseFloat(monthlyContribution) || 100,
      });
      onGoalCreated(newGoal);
      setShowAddGoal(false);
      setTitle('');
      setTargetAmount('');
      setMonthlyContribution('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoalId || !depositAmount) return;
    try {
      const updated = await api.depositToGoal(depositGoalId, parseFloat(depositAmount));
      onGoalUpdated(updated);
      setDepositGoalId(null);
      setDepositAmount('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmergencyDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyDepositAmount) return;
    try {
      const updated = await api.depositEmergencyFund(parseFloat(emergencyDepositAmount));
      onEmergencyFundUpdated(updated);
      setShowEmergencyDeposit(false);
      setEmergencyDepositAmount('');
    } catch (err) {
      console.error(err);
    }
  };

  // Emergency runway calculation
  const monthlyExpense = emergencyFund?.monthlyExpenses || 2800;
  const currentEmergencyBalance = emergencyFund?.currentAmount || 10500;
  const monthsOfRunway = (currentEmergencyBalance / (monthlyExpense || 1)).toFixed(1);

  return (
    <div id="savings_goals_view_root" className="space-y-8">
      {/* 1. Emergency Fund Health Meter */}
      <div className="p-6 rounded-2xl border bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white dark:to-slate-900 border-emerald-500/30 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Emergency Safety Net & Runway
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  {monthsOfRunway} Months Runway
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Guaranteed financial protection against unexpected medical, job loss, or urgent repairs
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowEmergencyDeposit(!showEmergencyDeposit)}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Deposit to Emergency Fund</span>
          </button>
        </div>

        {/* Inline Emergency Deposit Form */}
        {showEmergencyDeposit && (
          <form
            onSubmit={handleEmergencyDeposit}
            className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center space-x-2 animate-in fade-in"
          >
            <input
              type="number"
              required
              placeholder={`Amount to deposit (${currency})`}
              value={emergencyDepositAmount}
              onChange={(e) => setEmergencyDepositAmount(e.target.value)}
              className="flex-1 text-xs py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Confirm Deposit
            </button>
            <button
              type="button"
              onClick={() => setShowEmergencyDeposit(false)}
              className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Progress Bar & Stats */}
        <div className="space-y-2 pt-2">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Current: {formatCurrency(currentEmergencyBalance, currency)} / Target:{' '}
              {formatCurrency(emergencyFund?.targetAmount || 15000, currency)}
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {Math.min(
                100,
                Math.round(
                  (currentEmergencyBalance / (emergencyFund?.targetAmount || 15000)) * 100
                )
              )}
              % Funded
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  (currentEmergencyBalance / (emergencyFund?.targetAmount || 15000)) * 100
                )}%`,
              }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px]">Monthly Burn Rate</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(monthlyExpense, currency)}/mo
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px]">Survival Runway</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {monthsOfRunway} months without income
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px]">Safety Tier Status</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Optimal Tier (Recommended: 3–6 mo)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Savings Goals Planner */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Target className="w-5 h-5 text-indigo-500" />
              <span>Savings Goals & Milestones</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Target major life purchases, downpayments, and investment capital
            </p>
          </div>
          <button
            onClick={() => setShowAddGoal(!showAddGoal)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Savings Goal</span>
          </button>
        </div>

        {/* Add Goal Form */}
        {showAddGoal && (
          <form
            onSubmit={handleCreateGoal}
            className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-3 animate-in fade-in"
          >
            <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300">
              Create New Goal
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dream Vacation, House Deposit"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1">
                  Target Amount ({currency})
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1">
                  Monthly Contribution
                </label>
                <input
                  type="number"
                  placeholder="e.g. 250"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddGoal(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
              >
                Save Goal
              </button>
            </div>
          </form>
        )}

        {/* Goals Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            const isCompleted = g.currentAmount >= g.targetAmount;

            return (
              <div
                key={g.id}
                className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">
                      {g.title}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                      <Calendar className="w-3 h-3 mr-0.5" /> Target: {g.targetDate}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCompleted
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {isCompleted ? 'Achieved!' : `${pct}%`}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(g.currentAmount, currency)}
                    </span>
                    <span className="text-slate-400">
                      of {formatCurrency(g.targetAmount, currency)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Contributing {formatCurrency(g.monthlyContribution, currency)}/mo</span>
                    <span>{formatCurrency(Math.max(0, g.targetAmount - g.currentAmount), currency)} to go</span>
                  </div>
                </div>

                {/* Deposit Action */}
                {depositGoalId === g.id ? (
                  <form onSubmit={handleDeposit} className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <input
                      type="number"
                      required
                      placeholder={`Deposit amount (${currency})`}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full text-xs py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                    <div className="flex justify-end space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setDepositGoalId(null)}
                        className="px-2.5 py-1 text-xs text-slate-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 text-white"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setDepositGoalId(g.id)}
                    className="w-full py-2 text-xs font-bold rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Deposit Funds</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
