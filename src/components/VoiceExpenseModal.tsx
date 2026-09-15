import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, X, Check, Volume2, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { Transaction } from '../types';

interface VoiceExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionCreated: (tx: Transaction) => void;
  currency: string;
}

export const VoiceExpenseModal: React.FC<VoiceExpenseModalProps> = ({
  isOpen,
  onClose,
  onTransactionCreated,
  currency,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const samplePrompts = [
    'Spent $45 on groceries at Whole Foods',
    'Paid $120 for electricity bill with net banking',
    'Spent ₹450 on dinner with friends at cafe',
    'Received $1800 freelance client payment',
    'Spent $85 on gas and subway pass',
  ];

  // Speech Recognition hook
  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript('');
      setParsedData(null);
      setErrorMsg('');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setErrorMsg('');
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setTranscript(text);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setErrorMsg('Microphone access blocked. You can still test with the sample buttons below or type below!');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    if (isListening) {
      try {
        recognition.start();
      } catch (e) {
        // already started
      }
    } else {
      try {
        recognition.stop();
      } catch (e) {
        // already stopped
      }
    }

    return () => {
      try {
        recognition.abort();
      } catch (e) {}
    };
  }, [isListening, isOpen]);

  if (!isOpen) return null;

  const handleParse = async (textToParse: string) => {
    if (!textToParse.trim()) return;
    setIsProcessing(true);
    setErrorMsg('');
    try {
      const result = await api.parseVoiceExpense(textToParse);
      setParsedData(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse natural voice input');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!parsedData) return;
    setIsProcessing(true);
    try {
      const newTx = await api.createTransaction({
        type: parsedData.type,
        category: parsedData.category,
        amount: parsedData.amount,
        description: parsedData.description,
        date: parsedData.date,
        paymentMethod: parsedData.paymentMethod || 'Credit Card',
        notes: `Logged via AI Voice: "${transcript}"`,
      });
      onTransactionCreated(newTx);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="voice_modal_backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
    >
      <div
        id="voice_modal_card"
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                AI Voice & Natural Language Entry
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Powered by Gemini NLU & Speech Recognition
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

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Audio Visualizer / Mic Button */}
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <button
              id="btn_toggle_mic"
              onClick={() => setIsListening(!isListening)}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-500/20 shadow-rose-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40'
              }`}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isListening
                ? 'Listening... Speak naturally (e.g. "Spent $25 on lunch")'
                : 'Tap to start recording speech'}
            </p>
          </div>

          {/* Transcript input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Recognized Speech or Natural Language Input
            </label>
            <div className="relative">
              <input
                id="voice_transcript_input"
                type="text"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="e.g., Spent $45 at Starbucks on coffee with debit card"
                className="w-full text-sm py-2.5 px-3 pr-24 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                id="btn_parse_voice"
                onClick={() => handleParse(transcript)}
                disabled={!transcript.trim() || isProcessing}
                className="absolute right-1.5 top-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white flex items-center space-x-1"
              >
                <span>{isProcessing ? 'Analyzing...' : 'Parse AI'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Sample Prompts */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Try clicking a sample prompt:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(p);
                    handleParse(p);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 text-xs rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
              {errorMsg}
            </div>
          )}

          {/* Parsed Result Preview */}
          {parsedData && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Gemini Parsed Structure
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 capitalize">
                  {parsedData.type}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Description</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {parsedData.description}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Amount</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    ${parsedData.amount}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Category</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {parsedData.category}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Payment Method</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {parsedData.paymentMethod}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            id="btn_confirm_voice_entry"
            onClick={handleConfirm}
            disabled={!parsedData || isProcessing}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white shadow-sm flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Confirm & Record Transaction</span>
          </button>
        </div>
      </div>
    </div>
  );
};
