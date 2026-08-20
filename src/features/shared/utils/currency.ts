const currencySymbolCache = new Map<string, string>();

/**
 * Returns the localized currency symbol for an ISO 4217 code (e.g., 'NZD' -> '$').
 * Cached to prevent costly re-instantiation of Intl.NumberFormat during heavy re-renders.
 */
export function getCurrencySymbol(currencyCode = 'NZD'): string {
  if (currencySymbolCache.has(currencyCode)) {
    return currencySymbolCache.get(currencyCode)!;
  }

  const symbol =
    new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currencyCode,
    })
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value ?? currencyCode;

  currencySymbolCache.set(currencyCode, symbol);
  return symbol;
}

/**
 * Formats a raw number or string into a localized currency representation.
 */
export function formatCurrency(
  amount: number | string,
  currencyCode = 'NZD',
  locale = 'en-NZ'
): string {
  const numericAmount =
    typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    return `${getCurrencySymbol(currencyCode)}0.00`;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(numericAmount);
}

export interface CurrencyOption {
  value: string;
  label: string;
  code: string;
  name: string;
  symbol: string;
}

const pinnedCurrencies = ['NZD', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'];
const allCodes = Intl.supportedValuesOf('currency');

const formatCurrencyOption = (code: string): CurrencyOption => {
  const nameFormatter = new Intl.DisplayNames(['en'], { type: 'currency' });
  const symbolFormatter = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: code,
  });

  const symbol =
    symbolFormatter.formatToParts(0).find((p) => p.type === 'currency')
      ?.value || '';
  const name = nameFormatter.of(code) || '';

  return {
    value: code,
    code,
    name,
    symbol,
    label: symbol ? `${code} - ${name} (${symbol})` : `${code} - ${name}`,
  };
};

export const PINNED_CURRENCY_OPTIONS =
  pinnedCurrencies.map(formatCurrencyOption);

export const REMAINING_CURRENCY_OPTIONS = allCodes
  .filter((code) => !pinnedCurrencies.includes(code))
  .map(formatCurrencyOption);
