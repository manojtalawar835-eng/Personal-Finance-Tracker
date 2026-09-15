import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  Target,
  TrendingUp,
  LineChart,
  Bot,
  Database,
  ShieldCheck,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'savings'
  | 'investments'
  | 'analytics'
  | 'ai-advisor'
  | 'schema-docs';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isDarkMode: boolean;
  healthScore?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isDarkMode,
  healthScore = 88,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'budgets', label: 'Budgets & Bills', icon: PieChart },
    { id: 'savings', label: 'Savings & Safety', icon: Target },
    { id: 'investments', label: 'Portfolio & Debt', icon: TrendingUp },
    { id: 'analytics', label: 'Predictions & Reports', icon: LineChart, badge: 'AI' },
    { id: 'ai-advisor', label: 'AI Financial Advisor', icon: Bot, badge: 'Gemini' },
    { id: 'schema-docs', label: 'MySQL Architecture', icon: Database, badge: 'API' },
  ];

  return (
    <aside
      id="main_sidebar"
      className={`w-full lg:w-64 shrink-0 border-r flex flex-col justify-between transition-colors duration-200 ${
        isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/70 border-slate-200'
      }`}
    >
      <div className="p-4 space-y-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">
            Financial Modules
          </span>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav_tab_${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? isDarkMode
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold shadow-xs'
                      : isDarkMode
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? isDarkMode
                            ? 'text-emerald-400'
                            : 'text-emerald-600'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        item.badge === 'AI' || item.badge === 'Gemini'
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Financial Health Snapshot in Sidebar Footer */}
      <div className="p-4 m-3 rounded-2xl border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-850 dark:to-slate-900 dark:border-slate-800 border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Financial Health
            </span>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {healthScore}/100
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${healthScore}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
          Rated <strong className="text-emerald-500">Tier A</strong> with healthy savings rate and emergency buffer.
        </p>
      </div>
    </aside>
  );
};
