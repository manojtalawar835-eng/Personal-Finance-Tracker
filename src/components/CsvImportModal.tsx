import React, { useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, Check, AlertCircle, ArrowDownToLine } from 'lucide-react';
import { api } from '../lib/api';
import { Transaction } from '../types';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [csvContent, setCsvContent] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<Partial<Transaction>[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const sampleCsv = `date,type,category,amount,description,paymentMethod
2026-09-03,expense,Groceries,64.20,Trader Joe's Market Restock,Credit Card
2026-09-06,expense,Food & Dining,32.50,Chipotle Mexican Grill,Debit Card
2026-09-09,expense,Transportation,45.00,Shell Gas Fuel Station,Credit Card
2026-09-11,income,Freelance,850.00,React UI Design Consulting,UPI / Bank Transfer
2026-09-13,expense,Shopping,110.00,Books and Technical Manuals,Credit Card`;

  const parseCsvText = (text: string) => {
    try {
      const lines = text.trim().split('\n');
      if (lines.length < 2) {
        setParsedRows([]);
        return;
      }
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const rows: Partial<Transaction>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.split(',').map((v) => v.trim());
        const row: any = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx];
        });

        if (row.amount && row.description) {
          rows.push({
            date: row.date || new Date().toISOString().split('T')[0],
            type: row.type?.toLowerCase() === 'income' ? 'income' : 'expense',
            category: row.category || 'Other Expense',
            amount: parseFloat(row.amount),
            description: row.description,
            paymentMethod: row.paymentmethod || row.payment_method || 'Credit Card',
          });
        }
      }
      setParsedRows(rows);
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg('Failed to parse CSV: ' + err.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
      parseCsvText(content);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setCsvContent(sampleCsv);
    parseCsvText(sampleCsv);
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);
    setErrorMsg('');
    try {
      await api.batchImportTransactions(parsedRows);
      onImportComplete();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Import failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="csv_modal_backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
    >
      <div
        id="csv_modal_card"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Import Transactions from CSV
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bulk upload bank statements or exported transactions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {/* File Upload Zone */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center bg-slate-50/60 dark:bg-slate-800/30 flex flex-col items-center justify-center space-y-3">
            <UploadCloud className="w-10 h-10 text-slate-400" />
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Drag and drop your CSV file here or browse
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Required columns: date, type, category, amount, description, paymentMethod
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <label className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-sm transition-colors">
                Select CSV File
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={handleLoadSample}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750"
              >
                Load Sample Bank Statement
              </button>
            </div>
          </div>

          {/* Paste CSV textarea option */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Or paste raw CSV text
            </label>
            <textarea
              rows={4}
              value={csvContent}
              onChange={(e) => {
                setCsvContent(e.target.value);
                parseCsvText(e.target.value);
              }}
              placeholder="date,type,category,amount,description,paymentMethod..."
              className="w-full text-xs font-mono py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {errorMsg && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview Parsed Rows */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Preview Transactions to Import ({parsedRows.length} rows)
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Ready to batch insert
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Description</th>
                      <th className="p-2">Category</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                    {parsedRows.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2 text-slate-400">{r.date}</td>
                        <td className="p-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              r.type === 'income'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {r.type}
                          </span>
                        </td>
                        <td className="p-2 font-medium">{r.description}</td>
                        <td className="p-2 text-slate-500 dark:text-slate-400">{r.category}</td>
                        <td className="p-2 text-right font-bold">${r.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            id="btn_confirm_csv_import"
            onClick={handleImport}
            disabled={parsedRows.length === 0 || isProcessing}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white shadow-sm flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{isProcessing ? 'Importing...' : `Import ${parsedRows.length} Rows`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
