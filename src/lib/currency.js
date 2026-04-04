/**
 * Currency conversion helpers.
 * All conversions use user-entered rates — no external API calls.
 */

/**
 * Common currencies with their symbols for the selector.
 */
export const CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
]

/** Derive symbol map from CURRENCIES — single source of truth (L4 fix). */
const SYMBOL_MAP = Object.fromEntries(
  CURRENCIES.map(c => [c.code, c.symbol])
)

/**
 * Convert an amount from a foreign currency to INR.
 * @param {number} amount - Amount in foreign currency
 * @param {number} rate - Conversion rate (1 foreign = rate INR)
 * @returns {number} Amount in INR
 */
export function toINR(amount, rate = 1) {
  return Math.round(amount * rate * 100) / 100
}

/**
 * Format currency amount with symbol.
 * @param {number} amount - The amount
 * @param {string} currency - Currency code (default: INR)
 * @returns {string} Formatted string like "₹1,234.56"
 */
export function formatCurrency(amount, currency = 'INR') {
  const symbol = SYMBOL_MAP[currency] || `${currency} `
  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

  const prefix = amount < 0 ? '-' : ''
  return `${prefix}${symbol}${formatted}`
}

/**
 * Format INR amount (shorthand).
 */
export function formatINR(amount) {
  return formatCurrency(amount, 'INR')
}
