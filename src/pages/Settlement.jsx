import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGroup } from '../hooks/useGroup'
import MemberAvatar from '../components/MemberAvatar'
import { computeSettlement } from '../lib/settlement'
import { formatINR } from '../lib/currency'
import { archiveGroup } from '../lib/storage'

export default function Settlement() {
  const { group, groupId } = useGroup()
  const navigate = useNavigate()
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)

  if (!group) return null
  const members = group.members || []
  const expenses = group.expenses || []
  const { balances, transactions } = computeSettlement(expenses, members)

  const allSettled = expenses.length > 0 && transactions.length === 0
  const isArchived = group.is_archived

  const handleArchive = () => {
    archiveGroup(groupId)
    navigate('/')
  }

  return (
    <div className="page" id="settlement-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(`/group/${groupId}`)}>←</button>
        <div>
          <h1 className="headline-md">Settlement</h1>
          <p className="body-sm text-muted">{group.name}</p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🤝</div>
          <div className="empty-state-title">Nothing to settle</div>
          <div className="empty-state-text">Add expenses first.</div>
        </div>
      ) : (
        <>
          <div className="card animate-fade-in" style={{ textAlign: 'center', marginBottom: 24 }}>
            <span className="body-md">
              {transactions.length === 0
                ? '✅ All settled!'
                : `${transactions.length} transaction${transactions.length > 1 ? 's' : ''} to settle`}
            </span>
          </div>

          {/* Archive Prompt — only when fully settled and not already archived */}
          {allSettled && !isArchived && (
            <div className="archive-prompt animate-fade-in" id="archive-prompt">
              <div className="archive-prompt-icon">🎉</div>
              <h3 className="title-md">All debts are settled!</h3>
              <p className="body-sm text-muted">
                This group is fully settled. Archive it to keep your dashboard clean. You can always restore or permanently delete it later.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setShowArchiveConfirm(true)}
                id="btn-archive-group"
              >
                📦 Archive Group
              </button>
            </div>
          )}

          {isArchived && (
            <div className="archive-prompt animate-fade-in" style={{ borderColor: 'var(--outline-variant)' }}>
              <div className="archive-prompt-icon">📦</div>
              <h3 className="title-md">This group is archived</h3>
              <p className="body-sm text-muted">
                You can restore it or permanently delete it from the Home screen.
              </p>
            </div>
          )}

          {transactions.map((txn, i) => (
            <div key={i} className="card animate-fade-in" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <MemberAvatar name={txn.from.name} size="md" />
                <span className="body-sm">{txn.from.name}</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="headline-sm text-primary">{formatINR(txn.amount)}</div>
                <div className="body-sm text-muted">→</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <MemberAvatar name={txn.to.name} size="md" />
                <span className="body-sm">{txn.to.name}</span>
              </div>
            </div>
          ))}

          <h2 className="label-lg" style={{ margin: '24px 0 12px' }}>Net Balances</h2>
          {Array.from(balances.values()).sort((a, b) => b.balance - a.balance).map(({ memberId, name, balance }) => (
            <div key={memberId} className="card" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex items-center gap-sm">
                <MemberAvatar name={name} size="sm" />
                <span className="body-md">{name}</span>
              </div>
              <span className={balance >= 0 ? 'chip-positive' : 'chip-negative'}>
                {balance >= 0 ? '+' : ''}{formatINR(balance)}
              </span>
            </div>
          ))}
        </>
      )}

      {/* Archive Confirmation Dialog */}
      {showArchiveConfirm && (
        <div className="dialog-overlay" onClick={() => setShowArchiveConfirm(false)}>
          <div className="dialog-box" onClick={e => e.stopPropagation()}>
            <div className="dialog-icon">📦</div>
            <h3 className="headline-sm">Archive this group?</h3>
            <p className="body-md text-muted">
              "{group.name}" will be moved to your Archived Groups. You can restore it or permanently delete it later.
            </p>
            <div className="dialog-actions">
              <button className="btn btn-secondary" onClick={() => setShowArchiveConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleArchive} id="btn-confirm-archive">Archive</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .archive-prompt {
          background: var(--surface-container-high);
          border-radius: var(--radius-md);
          padding: var(--space-xl) var(--space-lg);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
          text-align: center;
          margin-bottom: var(--space-lg);
          border: 1px solid rgba(78, 222, 163, 0.2);
        }

        .archive-prompt-icon {
          font-size: 2.5rem;
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
