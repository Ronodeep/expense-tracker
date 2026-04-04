/**
 * Application-wide constants.
 * Single source of truth for magic strings used across components.
 */

export const SPLIT_TYPES = {
  EQUAL: 'EQUAL',
  RATIO: 'RATIO',
  PERCENTAGE: 'PERCENTAGE',
  EXACT: 'EXACT',
}

export const SPLIT_TYPE_LABELS = {
  EQUAL: 'Equal',
  RATIO: 'Ratio',
  PERCENTAGE: 'Percentage',
  EXACT: 'Exact',
}

export const APP_NAME = 'ExpenseTracker'
export const APP_YEAR = new Date().getFullYear()
export const COPYRIGHT_TEXT = `© ${APP_YEAR} ${APP_NAME}. All rights reserved.`
