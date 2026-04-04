/**
 * Predefined expense categories.
 * Users can also create custom categories — those are stored in the DB.
 */

export const PREDEFINED_CATEGORIES = [
  { name: 'Food', icon: '🍔', color: '#f59e0b' },
  { name: 'Transport', icon: '🚕', color: '#3b82f6' },
  { name: 'Accommodation', icon: '🏨', color: '#8b5cf6' },
  { name: 'Shopping', icon: '🛍️', color: '#ec4899' },
  { name: 'Entertainment', icon: '🎭', color: '#06b6d4' },
  { name: 'Tickets', icon: '🎟️', color: '#22c55e' },
  { name: 'Miscellaneous', icon: '📎', color: '#64748b' },
]

/**
 * Get category config by name.
 */
export function getCategoryConfig(name) {
  return PREDEFINED_CATEGORIES.find(c => c.name === name) || {
    name,
    icon: '📁',
    color: '#64748b',
  }
}
