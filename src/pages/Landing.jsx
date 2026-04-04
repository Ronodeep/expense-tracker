import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loadGroups, saveGroup, saveCurrentMember, loadGlobalProfile, saveGlobalProfile } from '../lib/storage'
import Copyright from '../components/Copyright'

/**
 * Generate a cryptographically strong group code.
 * Uses crypto.getRandomValues for unpredictability (C2 fix).
 */
function generateCode() {
  const array = new Uint8Array(4)
  crypto.getRandomValues(array)
  return Array.from(array, b => b.toString(36).padStart(2, '0'))
    .join('')
    .toUpperCase()
    .slice(0, 8)
}

export default function Landing() {
  const navigate = useNavigate()
  const [mode, setMode] = useState(null) // 'create' | 'join'
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [creatorName, setCreatorName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [joinName, setJoinName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const profile = loadGlobalProfile()
    if (profile && profile.name) {
      setCreatorName(profile.name)
      setJoinName(profile.name)
    }
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!groupName.trim() || !creatorName.trim()) return

    setLoading(true)
    try {
      const groupId = crypto.randomUUID()
      const code = generateCode()
      const memberId = crypto.randomUUID()

      const group = {
        id: groupId,
        name: groupName.trim(),
        description: groupDescription.trim(),
        code,
        default_currency: 'INR',
        conversion_rate: 1,
        created_at: new Date().toISOString(),
      }

      const member = {
        id: memberId,
        group_id: groupId,
        name: creatorName.trim(),
        is_creator: true,
        joined_at: new Date().toISOString(),
      }

      saveGroup(groupId, { ...group, members: [member], expenses: [], categories: [] })
      saveCurrentMember(groupId, member)
      saveGlobalProfile(member.name)
      navigate(`/group/${groupId}`)
    } catch (err) {
      console.error('Failed to create group:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (!joinCode.trim() || !joinName.trim()) return

    setLoading(true)
    try {
      const groups = loadGroups()
      const group = Object.values(groups).find(
        g => g.code.toLowerCase() === joinCode.trim().toLowerCase()
      )

      if (!group) {
        alert('Group not found! Check the code and try again.')
        setLoading(false)
        return
      }

      // Check if name already exists in group
      const existing = group.members.find(
        m => m.name.toLowerCase() === joinName.trim().toLowerCase()
      )

      if (existing) {
        saveCurrentMember(group.id, existing)
        saveGlobalProfile(existing.name)
        navigate(`/group/${group.id}`)
        return
      }

      // Add new member
      const memberId = crypto.randomUUID()
      const member = {
        id: memberId,
        group_id: group.id,
        name: joinName.trim(),
        is_creator: false,
        joined_at: new Date().toISOString(),
      }

      group.members.push(member)
      saveGroup(group.id, group)
      saveCurrentMember(group.id, member)
      saveGlobalProfile(member.name)
      navigate(`/group/${group.id}`)
    } catch (err) {
      console.error('Failed to join group:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="landing" id="landing-page">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          {/* Home navigation */}
          <Link to="/" className="home-link animate-fade-in" id="btn-home">
            ← Back to Home
          </Link>

          <h1 className="display-md landing-title">
            Split<span className="text-primary">Karo</span>
          </h1>
          <p className="body-lg landing-subtitle">
            Split expenses with friends, effortlessly.
            Track budgets, settle debts, and stay on top of your finances.
          </p>

          {!mode && (
            <div className="landing-actions animate-fade-in">
              <button
                className="btn btn-primary btn-lg btn-block"
                onClick={() => setMode('create')}
                id="btn-create-group"
              >
                ✦ Create New Group
              </button>
              <button
                className="btn btn-secondary btn-lg btn-block"
                onClick={() => setMode('join')}
                id="btn-join-group"
              >
                Join Existing Group
              </button>
            </div>
          )}

          {/* Create Group Form */}
          {mode === 'create' && (
            <form className="landing-form animate-slide-up" onSubmit={handleCreate} id="create-group-form">
              <div className="input-group">
                <label className="input-label">Your Name</label>
                <input
                  className="input"
                  type="text"
                  placeholder="What should we call you?"
                  value={creatorName}
                  onChange={e => setCreatorName(e.target.value)}
                  autoFocus
                  required
                  id="input-creator-name"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Group Name</label>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g., Egypt Tour 2026"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  required
                  id="input-group-name"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Description (Optional)</label>
                <input
                  className="input"
                  type="text"
                  placeholder="A short note about this group"
                  value={groupDescription}
                  onChange={e => setGroupDescription(e.target.value)}
                  id="input-group-description"
                />
              </div>
              <div className="landing-form-actions">
                <button className="btn btn-primary btn-block" type="submit" disabled={loading} id="btn-submit-create">
                  {loading ? 'Creating...' : 'Create Group'}
                </button>
                <button className="btn btn-tertiary btn-block" type="button" onClick={() => setMode(null)}>
                  ← Back
                </button>
              </div>
            </form>
          )}

          {/* Join Group Form */}
          {mode === 'join' && (
            <form className="landing-form animate-slide-up" onSubmit={handleJoin} id="join-group-form">
              <div className="input-group">
                <label className="input-label">Your Name</label>
                <input
                  className="input"
                  type="text"
                  placeholder="What should we call you?"
                  value={joinName}
                  onChange={e => setJoinName(e.target.value)}
                  autoFocus
                  required
                  id="input-join-name"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Group Code</label>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g., A3X1B2C4"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                  required
                  style={{ textTransform: 'uppercase', fontFamily: 'var(--font-headline)', letterSpacing: '0.1em' }}
                  id="input-join-code"
                />
              </div>
              <div className="landing-form-actions">
                <button className="btn btn-primary btn-block" type="submit" disabled={loading} id="btn-submit-join">
                  {loading ? 'Joining...' : 'Join Group'}
                </button>
                <button className="btn btn-tertiary btn-block" type="button" onClick={() => setMode(null)}>
                  ← Back
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Features — shown only when no form is active */}
        {!mode && (
          <div className="landing-features">
            <div className="feature-card animate-fade-in stagger-1">
              <span className="feature-icon">⚡</span>
              <h3 className="headline-sm">Smart Splitting</h3>
              <p className="body-md text-muted">Split by equal, ratio, percentage, or exact amounts.</p>
            </div>
            <div className="feature-card animate-fade-in stagger-2">
              <span className="feature-icon">💱</span>
              <h3 className="headline-sm">Multi-Currency</h3>
              <p className="body-md text-muted">Add expenses in any currency with your own conversion rate.</p>
            </div>
            <div className="feature-card animate-fade-in stagger-3">
              <span className="feature-icon">🤝</span>
              <h3 className="headline-sm">Instant Settlement</h3>
              <p className="body-md text-muted">See who owes whom with the fewest transactions possible.</p>
            </div>
          </div>
        )}

        <Copyright />
      </section>

      <style>{`
        .landing {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(160deg, #0b1326 0%, #1a103d 50%, #0b1326 100%);
          padding: var(--space-lg);
        }

        .landing-hero {
          width: 100%;
          max-width: 420px;
        }

        .landing-hero-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .home-link {
          color: var(--on-surface-variant);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: color var(--transition-fast);
          align-self: flex-start;
        }

        .home-link:hover {
          color: var(--primary);
        }

        .landing-title {
          text-align: center;
        }

        .landing-subtitle {
          text-align: center;
          color: var(--on-surface-variant);
          max-width: 320px;
          margin: 0 auto;
        }

        .landing-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .landing-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          background: var(--surface-container);
          padding: var(--space-lg);
          border-radius: var(--radius-md);
        }

        .landing-form-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          margin-top: var(--space-sm);
        }

        .landing-features {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          margin-top: var(--space-lg);
        }

        .feature-card {
          background: var(--surface-container-high);
          border-radius: var(--radius-md);
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .feature-icon {
          font-size: 1.75rem;
        }

        @media (min-width: 768px) {
          .landing-features {
            flex-direction: row;
          }
          .landing-hero {
            max-width: 640px;
          }
        }
      `}</style>
    </div>
  )
}
