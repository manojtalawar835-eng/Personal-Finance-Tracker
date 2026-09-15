import { CurrencyConfig } from '../types';

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rateAgainstUSD: 1.0 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateAgainstUSD: 84.2 },
  { code: 'EUR', symbol: '€', name: 'Euro', rateAgainstUSD: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rateAgainstUSD: 0.78 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateAgainstUSD: 154.5 },
];

export function convertAmount(
  amountInUSD: number,
  targetCurrencyCode: string
): number {
  const target = SUPPORTED_CURRENCIES.find((c) => c.code === targetCurrencyCode) || SUPPORTED_CURRENCIES[0];
  return Math.round(amountInUSD * target.rateAgainstUSD * 100) / 100;
}

export function formatCurrency(
  amountInUSD: number,
  currencyCode: string = 'USD'
): string {
  const target = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];
  const converted = amountInUSD * target.rateAgainstUSD;

  if (currencyCode === 'INR') {
    return `${target.symbol} ${converted.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    })}`;
  }

  if (currencyCode === 'JPY') {
    return `${target.symbol}${Math.round(converted).toLocaleString('ja-JP')}`;
  }

  return `${target.symbol}${converted.toLocaleString('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;
}
