import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getJoinedGroups, restoreGroup, permanentlyDeleteGroup, deleteAllArchivedGroups } from '../lib/storage'
import Copyright from '../components/Copyright'

export default function Home() {
  const [joinedGroups, setJoinedGroups] = useState([])
  const [activeTab, setActiveTab] = useState('active')
  const [confirmDelete, setConfirmDelete] = useState(null) // groupId or 'all'
  const navigate = useNavigate()

  const refresh = () => setJoinedGroups(getJoinedGroups())

  useEffect(() => {
    refresh()
  }, [])

  const activeGroups = joinedGroups.filter(({ group }) => !group.is_archived)
  const archivedGroups = joinedGroups.filter(({ group }) => group.is_archived)

  const handleRestore = (groupId) => {
    restoreGroup(groupId)
    refresh()
  }

  const handlePermanentDelete = (groupId) => {
    permanentlyDeleteGroup(groupId)
    setConfirmDelete(null)
    const updated = getJoinedGroups()
    setJoinedGroups(updated)
    // Auto-switch to active tab if no more archived groups
    if (!updated.some(({ group }) => group.is_archived)) {
      setActiveTab('active')
    }
  }

  const handleDeleteAll = () => {
    deleteAllArchivedGroups()
    setConfirmDelete(null)
    setActiveTab('active')
    refresh()
  }

  const formatArchiveDate = (timestamp) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="home-page" id="home-page">
      <div className="home-content">
        {/* Hero */}
        <header className="home-hero animate-fade-in">
          <h1 className="display-md home-title">
            Expense<span className="text-primary">Tracker</span>
          </h1>
          <p className="body-lg home-subtitle">
            Your all-in-one finance companion. Split expenses, track budgets,
            and stay on top of your money — all for free.
          </p>
        </header>

        {joinedGroups.length > 0 && (
          <section className="joined-groups-section animate-slide-up">
            <div className="section-header">
              <h2 className="headline-md">Your Groups</h2>
              <Link to="/splitkaro" className="btn btn-primary btn-sm">
                + New Group
              </Link>
            </div>

            {/* Tabs — only show if there are archived groups */}
            {archivedGroups.length > 0 && (
              <div className="group-tabs" id="group-tabs">
                <button
                  className={`group-tab ${activeTab === 'active' ? 'group-tab-active' : ''}`}
                  onClick={() => setActiveTab('active')}
                >
                  Active ({activeGroups.length})
                </button>
                <button
                  className={`group-tab ${activeTab === 'archived' ? 'group-tab-active' : ''}`}
                  onClick={() => setActiveTab('archived')}
                >
                  📦 Archived ({archivedGroups.length})
                </button>
              </div>
            )}

            {/* Archived Nudge Banner */}
            {activeTab === 'active' && archivedGroups.length > 0 && (
              <div className="archive-nudge animate-fade-in" id="archive-nudge">
                <div className="archive-nudge-content">
                  <span className="archive-nudge-icon">🗑️</span>
                  <div>
                    <span className="body-sm" style={{ fontWeight: 600 }}>
                      {archivedGroups.length} archived group{archivedGroups.length > 1 ? 's' : ''}
                    </span>
                    <span className="body-sm text-muted"> — delete to free up space</span>
                  </div>
                </div>
                <button
                  className="btn btn-sm archive-nudge-btn"
                  onClick={() => setActiveTab('archived')}
                >
                  View →
                </button>
              </div>
            )}

            {/* Active Groups */}
            {activeTab === 'active' && (
              <div className="groups-grid">
                {activeGroups.length === 0 ? (
                  <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                    <div className="empty-state-icon">📭</div>
                    <div className="empty-state-title">No active groups</div>
                    <div className="empty-state-text">Create a new group or restore one from the Archived tab.</div>
                  </div>
                ) : (
                  activeGroups.map(({ group, member }) => (
                    <Link to={`/group/${group.id}`} key={group.id} className="group-card">
                      <div className="group-card-header">
                        <h3 className="headline-sm text-truncate text-glow">{group.name}</h3>
                        <span className="group-code">{group.code}</span>
                      </div>
                      {group.description && (
                        <p className="body-sm text-muted text-truncate">{group.description}</p>
                      )}
                      <div className="group-card-footer">
                        <span className="member-badge">
                          <span className="member-avatar">{member.name.charAt(0).toUpperCase()}</span>
                          {member.name}
                        </span>
                        <span className="member-role">{member.is_creator ? 'Creator' : 'Member'}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Archived Groups */}
            {activeTab === 'archived' && (
              <>
                {/* Delete All Banner */}
                <div className="archive-banner animate-fade-in" id="archive-banner">
                  <div className="archive-banner-left">
                    <span className="archive-banner-icon">⚠️</span>
                    <div>
                      <p className="body-sm" style={{ fontWeight: 600 }}>
                        You have {archivedGroups.length} archived group{archivedGroups.length > 1 ? 's' : ''}
                      </p>
                      <p className="body-sm text-muted">Permanently delete them to free up storage space.</p>
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => setConfirmDelete('all')}
                    id="btn-delete-all-archived"
                  >
                    Delete All
                  </button>
                </div>

                <div className="groups-grid">
                  {archivedGroups.map(({ group, member }) => (
                    <div key={group.id} className="group-card group-card-archived">
                      <div className="group-card-header">
                        <h3 className="headline-sm text-truncate">{group.name}</h3>
                        <span className="group-code" style={{ opacity: 0.5 }}>{group.code}</span>
                      </div>
                      {group.description && (
                        <p className="body-sm text-muted text-truncate">{group.description}</p>
                      )}
                      <p className="body-sm text-muted" style={{ fontSize: '0.75rem' }}>
                        Archived {formatArchiveDate(group.archived_at)}
                      </p>
                      <div className="archived-card-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleRestore(group.id)}
                        >
                          ↩ Restore
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setConfirmDelete(group.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        <section className="module-grid" style={{ marginTop: joinedGroups.length > 0 ? 'var(--space-sm)' : 0 }}>
          {/* Module 1: Split Karo — Active (Only show if no groups) */}
          {joinedGroups.length === 0 && (
            <Link to="/splitkaro" className="module-card module-active animate-fade-in stagger-1" id="module-splitkaro">
              <div className="module-badge">Live</div>
              <div className="module-icon">💸</div>
              <h2 className="headline-md">SplitKaro</h2>
              <p className="body-md text-muted">
                Split group expenses with friends. Track who paid, who owes, and settle
                debts with the fewest transactions.
              </p>
              <div className="module-features">
                <span className="module-feature-chip">⚡ Smart Splitting</span>
                <span className="module-feature-chip">💱 Multi-Currency</span>
                <span className="module-feature-chip">📊 Analytics</span>
              </div>
              <span className="btn btn-primary btn-sm module-cta">
                Open SplitKaro →
              </span>
            </Link>
          )}

          {/* Module 2: Personal Expense Tracking — Coming Soon */}
          <div className="module-card module-coming-soon animate-fade-in stagger-2" id="module-personal-tracker">
            <div className="module-badge coming-soon-badge">Coming Soon</div>
            <div className="module-icon">📒</div>
            <h2 className="headline-md">Personal Tracker</h2>
            <p className="body-md text-muted">
              Track your daily expenses, set monthly budgets, and get insights
              into your spending habits.
            </p>
            <div className="module-features">
              <span className="module-feature-chip">📅 Monthly Views</span>
              <span className="module-feature-chip">🏷️ Tags & Labels</span>
              <span className="module-feature-chip">🔄 Recurring</span>
            </div>
            <span className="btn btn-secondary btn-sm module-cta" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              Coming in V3 🚧
            </span>
          </div>
        </section>

        <Copyright />
      </div>

      {/* Confirmation Dialog */}
      {confirmDelete && (
        <div className="dialog-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="dialog-box" onClick={e => e.stopPropagation()}>
            <div className="dialog-icon">⚠️</div>
            <h3 className="headline-sm">
              {confirmDelete === 'all' ? 'Delete all archived groups?' : 'Permanently delete this group?'}
            </h3>
            <p className="body-md text-muted">
              {confirmDelete === 'all'
                ? `This will permanently delete ${archivedGroups.length} group${archivedGroups.length > 1 ? 's' : ''} and all associated expense data. This action cannot be undone.`
                : 'This group and all its expense data will be permanently wiped. This cannot be undone.'}
            </p>
            <div className="dialog-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={() => confirmDelete === 'all' ? handleDeleteAll() : handlePermanentDelete(confirmDelete)}
                id="btn-confirm-permanent-delete"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .home-page {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(160deg, #0b1326 0%, #1a103d 50%, #0b1326 100%);
          padding: var(--space-lg);
        }

        .home-content {
          width: 100%;
          max-width: 640px;
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }

        .home-hero {
          text-align: center;
        }

        .home-title {
          margin-bottom: var(--space-md);
        }

        .home-subtitle {
          color: var(--on-surface-variant);
          max-width: 480px;
          margin: 0 auto;
        }

        /* Tabs */
        .group-tabs {
          display: flex;
          gap: 4px;
          background: var(--surface-container-lowest);
          border-radius: var(--radius-full);
          padding: 4px;
        }

        .group-tab {
          flex: 1;
          padding: 8px 16px;
          border: none;
          background: transparent;
          color: var(--on-surface-variant);
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .group-tab:hover {
          color: var(--on-surface);
        }

        .group-tab-active {
          background: var(--primary-container);
          color: var(--on-primary-container);
        }

        /* Nudge Banner (on Active tab) */
        .archive-nudge {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-md);
          padding: var(--space-md) var(--space-lg);
          background: rgba(255, 180, 171, 0.08);
          border-radius: var(--radius-md);
        }

        .archive-nudge-content {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .archive-nudge-icon {
          font-size: 1.25rem;
        }

        .archive-nudge-btn {
          background: rgba(255, 180, 171, 0.15);
          color: var(--error);
          border: none;
          white-space: nowrap;
        }

        .archive-nudge-btn:hover {
          background: rgba(255, 180, 171, 0.25);
        }

        /* Archive Banner (on Archived tab) */
        .archive-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-md);
          padding: var(--space-lg);
          background: var(--surface-container-high);
          border-radius: var(--radius-md);
          border-left: 3px solid var(--error);
        }

        .archive-banner-left {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .archive-banner-icon {
          font-size: 1.5rem;
        }

        /* Archived card styling */
        .group-card-archived {
          opacity: 0.65;
          border: 1px solid rgba(255, 180, 171, 0.1);
          cursor: default;
        }

        .group-card-archived:hover {
          transform: none;
          box-shadow: none;
          border-color: rgba(255, 180, 171, 0.2);
        }

        .archived-card-actions {
          display: flex;
          gap: var(--space-sm);
          margin-top: var(--space-sm);
        }

        /* Danger button */
        .btn-danger {
          background: var(--error-container);
          color: var(--on-error-container);
          border: none;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: var(--radius-full);
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.875rem;
          transition: all var(--transition-base);
        }

        .btn-danger:hover {
          background: var(--error);
          color: var(--on-error);
          transform: translateY(-1px);
        }

        .module-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-lg);
        }

        @media (min-width: 600px) {
          .module-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .module-card {
          position: relative;
          background: var(--surface-container-high);
          border-radius: var(--radius-md);
          padding: var(--space-xl) var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          text-decoration: none;
          color: inherit;
          transition: all var(--transition-base);
          border: 1px solid transparent;
        }

        .module-active {
          cursor: pointer;
        }

        .module-active:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-glow);
          border-color: var(--primary-container);
        }

        .module-coming-soon {
          opacity: 0.7;
          cursor: default;
        }

        .module-badge {
          position: absolute;
          top: var(--space-md);
          right: var(--space-md);
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          background: rgba(78, 222, 163, 0.15);
          color: var(--secondary);
        }

        .coming-soon-badge {
          background: rgba(255, 180, 171, 0.12);
          color: var(--error);
        }

        .module-icon {
          font-size: 2.5rem;
        }

        .module-features {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .module-feature-chip {
          padding: 4px 10px;
          border-radius: var(--radius-full);
          background: var(--surface-container-highest);
          font-size: 0.6875rem;
          font-weight: 500;
          color: var(--on-surface-variant);
          white-space: nowrap;
        }

        .module-cta {
          align-self: flex-start;
          margin-top: var(--space-sm);
        }

        .joined-groups-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .groups-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-md);
        }

        @media (min-width: 600px) {
          .groups-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .group-card {
          background: var(--surface-container);
          border-radius: var(--radius-md);
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          text-decoration: none;
          color: inherit;
          transition: all var(--transition-base);
          border: 1px solid transparent;
        }

        .group-card:hover {
          transform: translateY(-2px);
          background: var(--surface-container-high);
          box-shadow: var(--shadow-glow);
          border-color: var(--primary-container);
        }

        .group-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-sm);
        }

        .group-code {
          font-family: var(--font-headline);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--secondary);
          background: rgba(78, 222, 163, 0.15);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }

        .group-card-footer {
          margin-top: auto;
          padding-top: var(--space-md);
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .member-badge {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .member-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--primary);
          color: var(--on-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .member-role {
          font-size: 0.75rem;
          color: var(--on-surface-variant);
        }

        /* Confirmation Dialog */
        .dialog-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--space-lg);
          animation: fade-in var(--transition-base) ease;
        }

        .dialog-box {
          background: var(--surface-container-high);
          border-radius: var(--radius-lg);
          padding: var(--space-xl);
          max-width: 380px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-md);
          text-align: center;
          animation: slide-up var(--transition-base) ease;
        }

        .dialog-icon {
          font-size: 3rem;
        }

        .dialog-actions {
          display: flex;
          gap: var(--space-md);
          width: 100%;
          margin-top: var(--space-sm);
        }

        .dialog-actions .btn {
          flex: 1;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
