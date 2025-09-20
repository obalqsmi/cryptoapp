// File: src/utils/format.ts
export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
};

export const formatNumber = (value: number, digits: number = 2): string => {
  return Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
};

export const formatPercent = (value: number, digits: number = 2): string => {
  const formatted = Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
  return value > 0 ? `+${formatted}` : formatted;
};

export const compactNumber = (value: number): string => {
  return Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);
};
