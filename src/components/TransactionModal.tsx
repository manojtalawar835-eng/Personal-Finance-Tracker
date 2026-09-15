import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Upload,
  Receipt,
  Check,
  Calendar,
  CreditCard,
  Tag,
  FileText,
  DollarSign,
} from 'lucide-react';
import { api } from '../lib/api';
import { Transaction, TransactionType } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionSaved: (tx: Transaction) => void;
  currency: string;
}

const EXPENSE_CATEGORIES = [
  'Housing & Rent',
  'Food & Dining',
  'Groceries',
  'Transportation',
  'Utilities & Bills',
  'Entertainment',
  'Healthcare & Fitness',
  'Shopping',
  'Education',
  'Investments',
  'Personal Care',
  'Travel',
  'Other Expense',
];

const INCOME_CATEGORIES = [
  'Salary',
  'Business',
  'Freelance',
  'Investments & Dividends',
  'Rental Income',
  'Bonus',
  'Other Income',
];

const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'UPI / Bank Transfer',
  'Net Banking',
  'Cash',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onTransactionSaved,
  currency,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('Food & Dining');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('Credit Card');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  // Handle AI Auto-categorization
  const handleAutoCategorize = async () => {
    if (!description.trim()) {
      setErrorMsg('Enter a description first to auto-categorize');
      return;
    }
    setIsSuggesting(true);
    setErrorMsg('');
    try {
      const result = await api.autoCategorize(description, parseFloat(amount) || 0, type);
      if (result.category) {
        setCategory(result.category);
      }
    } catch (err) {
      console.warn('Auto categorize error', err);
    } finally {
      setIsSuggesting(false);
    }
  };

  // Handle Receipt Mock Upload
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      setReceiptUrl(dataUrl);
      // Auto-extract mock hint
      if (!description) {
        setDescription(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please enter a description');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const newTx = await api.createTransaction({
        type,
        amount: numAmount,
        description: description.trim(),
        category,
        date,
        paymentMethod: paymentMethod as any,
        isRecurring,
        notes: notes.trim(),
        receiptUrl,
      });
      onTransactionSaved(newTx);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="transaction_modal_backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
    >
      <div
        id="transaction_modal_card"
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className={`p-2 rounded-xl ${
                type === 'expense'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Add Transaction Entry
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log income, expense, or receipt invoice with AI categorization
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Type Toggle: Expense vs Income */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              id="tab_toggle_expense"
              onClick={() => {
                setType('expense');
                setCategory(EXPENSE_CATEGORIES[0]);
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'expense'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              id="tab_toggle_income"
              onClick={() => {
                setType('income');
                setCategory(INCOME_CATEGORIES[0]);
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'income'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Income (+)
            </button>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Amount ({currency})
              </label>
              <div className="relative">
                <input
                  id="input_tx_amount"
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-base font-bold py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Date
              </label>
              <div className="relative">
                <input
                  id="input_tx_date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Description with Auto-Suggest Category Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Description / Merchant
              </label>
              <button
                type="button"
                id="btn_ai_categorize_suggest"
                onClick={handleAutoCategorize}
                disabled={isSuggesting || !description.trim()}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 disabled:opacity-40"
              >
                <Sparkles className="w-3 h-3 mr-0.5" />
                <span>{isSuggesting ? 'Categorizing...' : 'AI Auto-Categorize'}</span>
              </button>
            </div>
            <input
              id="input_tx_description"
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Starbucks Coffee, Amazon Electronics, Paycheck"
              className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Category
              </label>
              <select
                id="select_tx_category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {(type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Payment Method
              </label>
              <select
                id="select_tx_payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recurring Checkbox */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              id="check_tx_recurring"
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
            />
            <label htmlFor="check_tx_recurring" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
              Mark as recurring monthly transaction (Subscription / Regular bill)
            </label>
          </div>

          {/* Receipt Upload & Preview */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Receipt Attachment / Bill Photo
            </label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center space-x-3">
                <Receipt className="w-5 h-5 text-slate-400" />
                <div className="text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {receiptUrl ? 'Receipt attached' : 'Attach receipt or invoice'}
                  </span>
                  <p className="text-[10px] text-slate-400">PNG, JPG, PDF receipt image</p>
                </div>
              </div>
              <label className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors">
                Browse
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="hidden"
                />
              </label>
            </div>
            {receiptUrl && (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 mt-2">
                <img
                  src={receiptUrl}
                  alt="Receipt"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={() => setReceiptUrl('')}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-rose-600 text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="input_tx_notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add personal notes, tax deductions, or tags..."
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {errorMsg && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn_submit_transaction"
              disabled={isSubmitting}
              className={`px-5 py-2 text-xs font-bold rounded-xl text-white shadow-sm flex items-center space-x-1.5 ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-500'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Record Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
