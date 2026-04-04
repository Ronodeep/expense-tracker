const AVATAR_COLORS = [
  '#7c3aed', '#3b82f6', '#22c55e', '#f59e0b',
  '#ec4899', '#06b6d4', '#8b5cf6', '#ef4444',
  '#14b8a6', '#f97316', '#6366f1', '#84cc16',
]

/**
 * Get a consistent color for a member based on their name.
 */
function getColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

/**
 * Get initials from a name (max 2 characters).
 */
function getInitials(name) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function MemberAvatar({ name, size = 'md', className = '' }) {
  const color = getColor(name)
  const initials = getInitials(name)

  return (
    <div
      className={`avatar avatar-${size} ${className}`}
      style={{ backgroundColor: color }}
      title={name}
    >
      {initials}
    </div>
  )
}
