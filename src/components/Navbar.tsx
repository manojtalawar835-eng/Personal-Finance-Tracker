import React from 'react';
import {
  Wallet,
  Mic,
  Plus,
  Moon,
  Sun,
  UserCheck,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { User } from '../types';
import { SUPPORTED_CURRENCIES } from '../lib/currency';

interface NavbarProps {
  user: User | null;
  currency: string;
  onCurrencyChange: (code: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAddTransaction: () => void;
  onOpenVoiceModal: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currency,
  onCurrencyChange,
  isDarkMode,
  onToggleDarkMode,
  onOpenAddTransaction,
  onOpenVoiceModal,
  onOpenAuthModal,
  onLogout,
}) => {
  return (
    <header
      id="main_navbar"
      className={`sticky top-0 z-30 border-b transition-colors duration-200 ${
        isDarkMode
          ? 'bg-slate-900/90 border-slate-800 text-white backdrop-blur-md'
          : 'bg-white/90 border-slate-200 text-slate-900 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-sm">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight">FinTrack</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                <Sparkles className="w-2.5 h-2.5 mr-0.5" /> AI Edition
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Smart Analytics & Cashflow Forecasting
            </p>
          </div>
        </div>

        {/* Actions & Utilities */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Currency Switcher */}
          <div className="relative">
            <select
              id="currency_selector"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className={`text-xs font-semibold py-1.5 px-2.5 rounded-lg border appearance-none pr-7 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 text-xs">
              ▼
            </div>
          </div>

          {/* Dark/Light Mode Toggle */}
          <button
            id="btn_theme_toggle"
            onClick={onToggleDarkMode}
            aria-label="Toggle theme"
            className={`p-2 rounded-lg border transition-colors ${
              isDarkMode
                ? 'border-slate-800 bg-slate-800/80 text-amber-300 hover:bg-slate-800'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Voice Entry Button */}
          <button
            id="btn_voice_entry"
            onClick={onOpenVoiceModal}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isDarkMode
                ? 'border-indigo-500/30 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/50'
                : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
            title="Voice Transaction Entry"
          >
            <Mic className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span className="hidden md:inline">Voice Log</span>
          </button>

          {/* Quick Add Transaction */}
          <button
            id="btn_quick_add"
            onClick={onOpenAddTransaction}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Entry</span>
          </button>

          {/* User Account / Auth */}
          {user ? (
            <div className="flex items-center space-x-2 pl-1 border-l border-slate-200 dark:border-slate-800">
              <div
                className="w-8 h-8 rounded-full ring-2 ring-emerald-500/30 overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200"
                title={`${user.name} (${user.email})`}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <button
                id="btn_logout"
                onClick={onLogout}
                aria-label="Log out"
                title="Logout"
                className={`p-1.5 rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'border-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-800'
                    : 'border-slate-200 text-slate-500 hover:text-red-600 hover:bg-slate-100'
                }`}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="btn_login"
              onClick={onOpenAuthModal}
              className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                isDarkMode
                  ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
