/**
 * Centralized localStorage data layer.
 * Single source of truth for all reads/writes — prevents
 * corruption risk from scattered JSON.parse calls.
 */

const STORAGE_KEY = 'expense_tracker_groups'
const BACKUP_KEY = 'expense_tracker_groups_backup'
const LEGACY_KEY = 'groups' // Old key from pre-refactor

/**
 * Load all groups from localStorage with backup recovery and legacy migration.
 * @returns {Object} Groups keyed by groupId
 */
export function loadGroups() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY)

    // Migrate from legacy key if new key is empty
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_KEY)
      if (legacy) {
        localStorage.setItem(STORAGE_KEY, legacy)
        localStorage.removeItem(LEGACY_KEY)
        raw = legacy
      }
    }

    if (!raw) return {}
    const parsed = JSON.parse(raw)
    localStorage.setItem(BACKUP_KEY, raw)
    return parsed
  } catch {
    try {
      const backup = localStorage.getItem(BACKUP_KEY)
      return backup ? JSON.parse(backup) : {}
    } catch {
      return {}
    }
  }
}

/**
 * Save all groups to localStorage.
 * @param {Object} groups - Groups object keyed by groupId
 */
export function saveGroups(groups) {
  const json = JSON.stringify(groups)
  localStorage.setItem(STORAGE_KEY, json)
}

/**
 * Load a single group by ID.
 * @param {string} groupId
 * @returns {Object|null}
 */
export function loadGroup(groupId) {
  return loadGroups()[groupId] || null
}

/**
 * Save a single group (merges into existing groups).
 * @param {string} groupId
 * @param {Object} group
 */
export function saveGroup(groupId, group) {
  const all = loadGroups()
  all[groupId] = group
  saveGroups(all)
}

/**
 * Load the current member for a group.
 * @param {string} groupId
 * @returns {Object|null}
 */
export function loadCurrentMember(groupId) {
  try {
    return JSON.parse(localStorage.getItem(`currentMember_${groupId}`) || 'null')
  } catch {
    return null
  }
}

/**
 * Save the current member for a group.
 * @param {string} groupId
 * @param {Object} member
 */
export function saveCurrentMember(groupId, member) {
  localStorage.setItem(`currentMember_${groupId}`, JSON.stringify(member))
}
