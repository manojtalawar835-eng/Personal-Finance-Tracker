/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { TransactionsView } from './components/views/TransactionsView';
import { BudgetsBillsView } from './components/views/BudgetsBillsView';
import { SavingsGoalsView } from './components/views/SavingsGoalsView';
import { InvestmentsDebtView } from './components/views/InvestmentsDebtView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { AiAdvisorView } from './components/views/AiAdvisorView';
import { SchemaDocsView } from './components/views/SchemaDocsView';
import { VoiceExpenseModal } from './components/VoiceExpenseModal';
import { TransactionModal } from './components/TransactionModal';
import { CsvImportModal } from './components/CsvImportModal';
import { AuthModal } from './components/AuthModal';

import { api, getAuthToken, removeAuthToken } from './lib/api';
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
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem('fin_currency') || 'USD';
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('fin_theme') === 'dark';
  });

  // User & Domain Data
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [emergencyFund, setEmergencyFund] = useState<EmergencyFund | null>(null);

  // AI Analytics
  const [healthScore, setHealthScore] = useState<FinancialHealthScore | null>(null);
  const [insights, setInsights] = useState<SpendingInsight[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [detectedSubs, setDetectedSubs] = useState<any[]>([]);

  // Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync dark mode class with root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('fin_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('fin_theme', 'light');
    }
  }, [isDarkMode]);

  // Load all initial data
  const loadAppData = useCallback(async () => {
    try {
      // Ensure token exists, or perform quick demo login
      if (!getAuthToken()) {
        try {
          await api.demoLogin();
        } catch (e) {
          console.warn('Auto demo login skipped', e);
        }
      }

      // Fetch user profile
      try {
        const userProfile = await api.getProfile();
        setUser(userProfile);
        if (userProfile.currency && !localStorage.getItem('fin_currency')) {
          setCurrency(userProfile.currency);
        }
      } catch (err) {
        console.warn('Profile fetch error', err);
      }

      // Fetch all modules in parallel
      const [
        txList,
        budgetList,
        goalList,
        billList,
        invList,
        debtList,
        emerFund,
      ] = await Promise.all([
        api.getTransactions().catch(() => []),
        api.getBudgets().catch(() => []),
        api.getSavingsGoals().catch(() => []),
        api.getBills().catch(() => []),
        api.getInvestments().catch(() => []),
        api.getDebts().catch(() => []),
        api.getEmergencyFund().catch(() => null),
      ]);

      setTransactions(txList);
      setBudgets(budgetList);
      setGoals(goalList);
      setBills(billList);
      setInvestments(invList);
      setDebts(debtList);
      setEmergencyFund(emerFund);

      // Fetch AI Insights
      api.getAiInsights().then((aiData) => {
        if (aiData) {
          setHealthScore(aiData.healthScore);
          setInsights(aiData.insights || []);
          setAnomalies(aiData.anomalies || []);
          setDetectedSubs(aiData.detectedSubscriptions || []);
        }
      }).catch((e) => console.warn('AI insights load error', e));

    } catch (error) {
      console.error('Failed to load application state', error);
    }
  }, []);

  useEffect(() => {
    loadAppData();
  }, [loadAppData]);

  const handleCurrencyChange = (newCurr: string) => {
    setCurrency(newCurr);
    localStorage.setItem('fin_currency', newCurr);
    if (user) {
      api.updateProfile({ currency: newCurr }).catch(() => {});
    }
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    loadAppData();
  };

  const handleTransactionSaved = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
    // Refresh insights in background
    api.getAiInsights().then((aiData) => {
      if (aiData) {
        setHealthScore(aiData.healthScore);
        setInsights(aiData.insights || []);
        setAnomalies(aiData.anomalies || []);
      }
    }).catch(() => {});
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayBill = async (billId: string) => {
    try {
      const res = await api.payBill(billId);
      if (res.bill) {
        setBills((prev) => prev.map((b) => (b.id === billId ? res.bill : b)));
      }
      // reload transactions to show logged payment
      const updatedTx = await api.getTransactions();
      setTransactions(updatedTx);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      id="app_root"
      className={`min-h-screen font-sans transition-colors duration-200 ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100/70 text-slate-900'
      }`}
    >
      {/* Top Navigation */}
      <Navbar
        user={user}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenAddTransaction={() => setIsTxModalOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isDarkMode={isDarkMode}
          healthScore={healthScore?.score || 88}
        />

        {/* View Canvas */}
        <main id="main_content_area" className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              budgets={budgets}
              goals={goals}
              bills={bills}
              emergencyFund={emergencyFund}
              healthScore={healthScore}
              insights={insights}
              anomalies={anomalies}
              currency={currency}
              onOpenAddTransaction={(defType) => setIsTxModalOpen(true)}
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              onPayBill={handlePayBill}
              onNavigateTab={(tab) => setActiveTab(tab)}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              currency={currency}
              onOpenAddModal={() => setIsTxModalOpen(true)}
              onOpenCsvImport={() => setIsCsvModalOpen(true)}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsBillsView
              budgets={budgets}
              bills={bills}
              transactions={transactions}
              currency={currency}
              onBudgetCreated={(b) => setBudgets((prev) => [...prev, b])}
              onBudgetDeleted={(id) => {
                api.deleteBudget(id).then(() => {
                  setBudgets((prev) => prev.filter((b) => b.id !== id));
                });
              }}
              onBillCreated={(bill) => setBills((prev) => [...prev, bill])}
              onPayBill={handlePayBill}
              detectedSubscriptions={detectedSubs}
            />
          )}

          {activeTab === 'savings' && (
            <SavingsGoalsView
              goals={goals}
              emergencyFund={emergencyFund}
              currency={currency}
              onGoalCreated={(g) => setGoals((prev) => [...prev, g])}
              onGoalUpdated={(g) => setGoals((prev) => prev.map((item) => (item.id === g.id ? g : item)))}
              onEmergencyFundUpdated={(ef) => setEmergencyFund(ef)}
            />
          )}

          {activeTab === 'investments' && (
            <InvestmentsDebtView
              investments={investments}
              debts={debts}
              currency={currency}
              onInvestmentCreated={(inv) => setInvestments((prev) => [...prev, inv])}
              onDebtCreated={(d) => setDebts((prev) => [...prev, d])}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              transactions={transactions}
              currency={currency}
            />
          )}

          {activeTab === 'ai-advisor' && (
            <AiAdvisorView
              healthScore={healthScore}
              insights={insights}
              anomalies={anomalies}
              currency={currency}
            />
          )}

          {activeTab === 'schema-docs' && <SchemaDocsView />}
        </main>
      </div>

      {/* Modals */}
      <VoiceExpenseModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTransactionCreated={handleTransactionSaved}
        currency={currency}
      />

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onTransactionSaved={handleTransactionSaved}
        currency={currency}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportComplete={() => {
          api.getTransactions().then(setTransactions);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
