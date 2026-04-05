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

const GLOBAL_PROFILE_KEY = 'expense_tracker_profile'

/**
 * Load the global user profile.
 * @returns {Object|null} { name: string, id?: string }
 */
export function loadGlobalProfile() {
  try {
    return JSON.parse(localStorage.getItem(GLOBAL_PROFILE_KEY) || 'null')
  } catch {
    return null
  }
}

/**
 * Save the global user profile.
 * @param {string} name
 */
export function saveGlobalProfile(name) {
  let profile = loadGlobalProfile() || { id: crypto.randomUUID() }
  profile.name = name
  localStorage.setItem(GLOBAL_PROFILE_KEY, JSON.stringify(profile))
}

/**
 * Get all groups the current browser profile has joined.
 * @returns {Array} Array of { group, member }
 */
export function getJoinedGroups() {
  const joined = []
  const allGroups = loadGroups()
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('currentMember_')) {
      const groupId = key.substring('currentMember_'.length)
      const memberRaw = localStorage.getItem(key)
      if (memberRaw && allGroups[groupId]) {
        try {
          const member = JSON.parse(memberRaw)
          joined.push({
            group: allGroups[groupId],
            member
          })
        } catch (e) {
          // ignore parse errors
        }
      }
    }
  }
  
  return joined
}

/**
 * Archive a group (soft-delete). Sets is_archived and archived_at.
 * @param {string} groupId
 */
export function archiveGroup(groupId) {
  const all = loadGroups()
  if (all[groupId]) {
    all[groupId].is_archived = true
    all[groupId].archived_at = Date.now()
    saveGroups(all)
  }
}

/**
 * Restore an archived group back to active.
 * @param {string} groupId
 */
export function restoreGroup(groupId) {
  const all = loadGroups()
  if (all[groupId]) {
    delete all[groupId].is_archived
    delete all[groupId].archived_at
    saveGroups(all)
  }
}

/**
 * Permanently delete a group and clean up its member key from localStorage.
 * @param {string} groupId
 */
export function permanentlyDeleteGroup(groupId) {
  const all = loadGroups()
  delete all[groupId]
  saveGroups(all)
  localStorage.removeItem(`currentMember_${groupId}`)
}

/**
 * Permanently delete ALL archived groups.
 */
export function deleteAllArchivedGroups() {
  const all = loadGroups()
  const toDelete = Object.keys(all).filter(id => all[id].is_archived)
  toDelete.forEach(id => {
    delete all[id]
    localStorage.removeItem(`currentMember_${id}`)
  })
  saveGroups(all)
}
