import React, { useState, useEffect } from 'react';
import {
  Database,
  Code2,
  Copy,
  Check,
  Download,
  Server,
  KeyRound,
  Layers,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../lib/api';

export const SchemaDocsView: React.FC = () => {
  const [schemaData, setSchemaData] = useState<{ databaseEngine: string; tables: string[]; sqlScript: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'apis'>('sql');

  useEffect(() => {
    async function loadSchema() {
      try {
        const data = await api.getMySQLSchema();
        setSchemaData(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadSchema();
  }, []);

  const handleCopy = () => {
    if (!schemaData?.sqlScript) return;
    navigator.clipboard.writeText(schemaData.sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!schemaData?.sqlScript) return;
    const element = document.createElement('a');
    const file = new Blob([schemaData.sqlScript], { type: 'text/sql' });
    element.href = URL.createObjectURL(file);
    element.download = 'finance_tracker_mysql_schema.sql';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const apiEndpoints = [
    { method: 'POST', path: '/api/auth/register', desc: 'Create user with bcrypt password hash & initial preferences' },
    { method: 'POST', path: '/api/auth/login', desc: 'Verify credentials and issue signed JWT bearer token' },
    { method: 'GET', path: '/api/transactions', desc: 'Fetch user transactions with category and date sorting' },
    { method: 'POST', path: '/api/transactions', desc: 'Record new income/expense entry with receipt URL' },
    { method: 'POST', path: '/api/transactions/batch-import', desc: 'Batch bulk insert transactions from parsed CSV bank statement' },
    { method: 'GET', path: '/api/budgets', desc: 'Retrieve category spending caps and calculate current utilization' },
    { method: 'GET', path: '/api/savings', desc: 'List active savings milestones and target completion dates' },
    { method: 'POST', path: '/api/bills/:id/pay', desc: 'Mark recurring bill as paid and append transaction ledger entry' },
    { method: 'GET', path: '/api/investments', desc: 'Track equities, crypto, mutual funds and compute total ROI' },
    { method: 'POST', path: '/api/ai/categorize', desc: 'Gemini auto-categorization of merchant description' },
    { method: 'POST', path: '/api/ai/voice-parse', desc: 'Speech-to-text NLU entity extraction of transaction details' },
    { method: 'GET', path: '/api/ai/insights', desc: 'Generate spending leaks analysis and compute financial health score' },
    { method: 'GET', path: '/api/ai/predict-cashflow', desc: '3-Month machine learning forward-looking cash flow forecast' },
  ];

  return (
    <div id="schema_docs_view_root" className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Database className="w-5 h-5 text-emerald-500" />
            <span>MySQL Relational Architecture & REST API Spec</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Placement-grade relational schema design with foreign key constraints and normalized entities
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied SQL' : 'Copy DDL Script'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download schema.sql</span>
          </button>
        </div>
      </div>

      {/* Relational Entity Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 block text-[10px] font-semibold">Engine</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
            MySQL 8.0 (InnoDB)
          </span>
          <span className="text-[10px] text-emerald-600">ACID Compliant</span>
        </div>
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 block text-[10px] font-semibold">Tables Normalized</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
            8 Relational Entities
          </span>
          <span className="text-[10px] text-indigo-600">Foreign Keys & Cascades</span>
        </div>
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 block text-[10px] font-semibold">Security</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
            JWT + Bcrypt Hash
          </span>
          <span className="text-[10px] text-slate-500">Stateless Bearer Tokens</span>
        </div>
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 block text-[10px] font-semibold">AI Integration</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
            Gemini 2.5 Flash
          </span>
          <span className="text-[10px] text-purple-600">Server-Side SDK</span>
        </div>
      </div>

      {/* Tabs for SQL DDL vs REST API Docs */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'sql'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            MySQL DDL Schema (schema.sql)
          </button>
          <button
            onClick={() => setActiveTab('apis')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'apis'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            REST API Routes & Controllers
          </button>
        </div>

        {activeTab === 'sql' ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-950 text-slate-200 font-mono text-xs">
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>MySQL Relational DDL Script</span>
              <span>8 Tables • Constraints • UTF8MB4</span>
            </div>
            <pre className="p-4 overflow-x-auto max-h-[500px] leading-relaxed text-emerald-400/90 selection:bg-emerald-500/30">
              {schemaData?.sqlScript || 'Loading SQL schema...'}
            </pre>
          </div>
        ) : (
          <div className="rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5 pl-5">Method</th>
                    <th className="p-3.5">Endpoint</th>
                    <th className="p-3.5 pr-5">Description & Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  {apiEndpoints.map((ep, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 pl-5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            ep.method === 'GET'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {ep.method}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-900 dark:text-slate-100">
                        {ep.path}
                      </td>
                      <td className="p-3.5 pr-5 text-slate-500 dark:text-slate-400">
                        {ep.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
