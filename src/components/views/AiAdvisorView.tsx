import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Send,
  MessageSquare,
  Zap,
  TrendingDown,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { FinancialHealthScore, SpendingInsight, AnomalyItem } from '../../types';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/currency';

interface AiAdvisorViewProps {
  healthScore: FinancialHealthScore | null;
  insights: SpendingInsight[];
  anomalies: AnomalyItem[];
  currency: string;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const AiAdvisorView: React.FC<AiAdvisorViewProps> = ({
  healthScore,
  insights,
  anomalies,
  currency,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: "Hello Alex! I am your AI Financial Advisor. I've audited your current income, expenses, subscriptions, and investments. How can I help optimize your finances today?",
      time: 'Just now',
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  const sampleQuestions = [
    'How can I save $400 more every month?',
    'Should I pay off debt or invest in index funds first?',
    'Review my food & grocery spending',
    'Am I ready to buy a house in 2 years?',
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated = [...messages, { sender: 'user' as const, text: textToSend, time: now }];
    setMessages(updated);
    setInputMsg('');
    setIsSending(true);

    try {
      const history = updated.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const res = await api.sendChatMessage(textToSend, history);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.reply || 'Here is what I recommend based on your financial statements.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Unable to connect to AI advisor. Please check your network or try again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const score = healthScore?.score || 88;
  const grade = healthScore?.grade || 'Tier A (Excellent)';

  return (
    <div id="ai_advisor_view_root" className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Bot className="w-5 h-5 text-indigo-500" />
            <span>AI Financial Advisor & Health Diagnostics</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Powered by Google Gemini to identify spending leaks, risk buffers, and growth plans
          </p>
        </div>
      </div>

      {/* 1. Health Score Card & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Meter */}
        <div className="p-6 rounded-2xl border bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-white dark:to-slate-900 border-indigo-500/30 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Financial Health Score
              </span>
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {score}
              </span>
              <span className="text-slate-400 font-bold text-lg">/100</span>
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {grade}
            </div>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${score}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Calculated across savings rate (35%), budget discipline (25%), emergency runway (25%), and debt-to-income (15%).
            </p>
          </div>
        </div>

        {/* Breakdown Pillars */}
        <div className="lg:col-span-2 p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Diagnostics Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">Savings Ratio</span>
              <span className="font-bold text-emerald-600 text-sm mt-0.5 block">
                {healthScore?.breakdown?.savingsRatio || 92}/100
              </span>
              <span className="text-[10px] text-slate-500">Above 20% mark</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">Budget Discipline</span>
              <span className="font-bold text-emerald-600 text-sm mt-0.5 block">
                {healthScore?.breakdown?.budgetDiscipline || 86}/100
              </span>
              <span className="text-[10px] text-slate-500">Under category caps</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">Emergency Fund</span>
              <span className="font-bold text-emerald-600 text-sm mt-0.5 block">
                {healthScore?.breakdown?.emergencyFund || 88}/100
              </span>
              <span className="text-[10px] text-slate-500">3.8 mo safety buffer</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">Debt Ratio</span>
              <span className="font-bold text-emerald-600 text-sm mt-0.5 block">
                {healthScore?.breakdown?.debtRatio || 85}/100
              </span>
              <span className="text-[10px] text-slate-500">Low DTI (&lt;25%)</span>
            </div>
          </div>

          {/* AI Key Insights */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Personalized Recommendations:
            </span>
            <div className="space-y-1.5">
              {insights.map((ins, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-start space-x-3 text-xs"
                >
                  <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {ins.title}
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {ins.description}
                    </p>
                    {ins.estimatedSavings && (
                      <span className="inline-block mt-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        Estimated monthly savings: {formatCurrency(ins.estimatedSavings, currency)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive AI Financial Advisor Chatbot */}
      <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Ask FinAI Advisor
              </h3>
              <p className="text-xs text-slate-400">
                Instant conversational answers grounded in your real portfolio & ledger
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Gemini Online
          </span>
        </div>

        {/* Chat History Box */}
        <div className="h-80 overflow-y-auto space-y-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-xs'
                    : 'bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-bl-xs shadow-xs'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-400 px-1 mt-0.5">{m.time}</span>
            </div>
          ))}
          {isSending && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 italic">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-500" />
              <span>Analyzing financial models with Gemini...</span>
            </div>
          )}
        </div>

        {/* Sample Prompt Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] font-medium px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputMsg);
          }}
          className="flex items-center space-x-2 pt-2"
        >
          <input
            id="chat_advisor_input"
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Ask anything about your budget, debt payoff, or savings plan..."
            className="flex-1 text-xs py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputMsg.trim() || isSending}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
