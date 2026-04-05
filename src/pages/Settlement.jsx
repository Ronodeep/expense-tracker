import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGroup } from '../hooks/useGroup'
import MemberAvatar from '../components/MemberAvatar'
import { computeSettlement } from '../lib/settlement'
import { formatINR } from '../lib/currency'
import { archiveGroup, loadGroup, saveGroup } from '../lib/storage'

export default function Settlement() {
  const { group, groupId, refresh } = useGroup()
  const navigate = useNavigate()
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
  const [settledTxns, setSettledTxns] = useState(() => {
    // Load persisted settled transactions from group data
    const g = loadGroup(groupId)
    return g?.settled_transactions || []
  })

  if (!group) return null
  const members = group.members || []
  const expenses = group.expenses || []
  const { balances, transactions } = computeSettlement(expenses, members)

  // Check if a transaction is marked as settled
  const isTxnSettled = (txn) => {
    return settledTxns.some(
      s => s.from === txn.from.memberId && s.to === txn.to.memberId && Math.abs(s.amount - txn.amount) < 0.01
    )
  }

  // Count unsettled transactions
  const unsettledCount = transactions.filter(t => !isTxnSettled(t)).length
  const allSettled = expenses.length > 0 && unsettledCount === 0
  const isArchived = group.is_archived

  const handleMarkSettled = (txn) => {
    const entry = { from: txn.from.memberId, to: txn.to.memberId, amount: txn.amount, settled_at: Date.now() }
    const updated = [...settledTxns, entry]
    setSettledTxns(updated)

    // Persist to group data
    const current = loadGroup(groupId)
    if (current) {
      current.settled_transactions = updated
      saveGroup(groupId, current)
    }
  }

  const handleUndoSettle = (txn) => {
    const updated = settledTxns.filter(
      s => !(s.from === txn.from.memberId && s.to === txn.to.memberId && Math.abs(s.amount - txn.amount) < 0.01)
    )
    setSettledTxns(updated)

    const current = loadGroup(groupId)
    if (current) {
      current.settled_transactions = updated
      saveGroup(groupId, current)
    }
  }

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
          {/* Status Summary */}
          <div className="card animate-fade-in" style={{ textAlign: 'center', marginBottom: 24 }}>
            {allSettled ? (
              <span className="body-md">✅ All settled!</span>
            ) : (
              <span className="body-md">
                {unsettledCount} transaction{unsettledCount > 1 ? 's' : ''} to settle
                {transactions.length > unsettledCount && (
                  <span className="text-muted"> · {transactions.length - unsettledCount} marked as paid</span>
                )}
              </span>
            )}
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

          {/* Unsettled Warning — show when there are pending debts */}
          {!allSettled && !isArchived && transactions.length > 0 && (
            <div className="settle-hint animate-fade-in">
              <span className="body-sm text-muted">
                💡 Mark each payment as settled below. Once all debts are cleared, you can archive this group.
              </span>
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

          {/* Transaction Cards */}
          {transactions.map((txn, i) => {
            const settled = isTxnSettled(txn)
            return (
              <div
                key={i}
                className={`settlement-card animate-fade-in ${settled ? 'settlement-card-settled' : ''}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="settlement-card-row">
                  <div className="settlement-member">
                    <MemberAvatar name={txn.from.name} size="md" />
                    <span className="body-sm">{txn.from.name}</span>
                  </div>
                  <div className="settlement-arrow">
                    <div className="headline-sm text-primary">{formatINR(txn.amount)}</div>
                    <div className="body-sm text-muted">→ pays →</div>
                  </div>
                  <div className="settlement-member">
                    <MemberAvatar name={txn.to.name} size="md" />
                    <span className="body-sm">{txn.to.name}</span>
                  </div>
                </div>
                <div className="settlement-card-action">
                  {settled ? (
                    <button
                      className="btn settle-btn settle-btn-done"
                      onClick={() => handleUndoSettle(txn)}
                    >
                      ✅ Settled · Undo
                    </button>
                  ) : (
                    <button
                      className="btn settle-btn settle-btn-pending"
                      onClick={() => handleMarkSettled(txn)}
                    >
                      💰 Mark as Settled
                    </button>
                  )}
                </div>
              </div>
            )
          })}

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

        .settle-hint {
          padding: var(--space-md) var(--space-lg);
          background: rgba(210, 187, 255, 0.06);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-lg);
          text-align: center;
        }

        /* Settlement Transaction Cards */
        .settlement-card {
          background: var(--surface-container-high);
          border-radius: var(--radius-md);
          padding: var(--space-lg);
          margin-bottom: var(--space-md);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          transition: all var(--transition-base);
        }

        .settlement-card-settled {
          opacity: 0.5;
          background: var(--surface-container);
        }

        .settlement-card-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .settlement-member {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 60px;
        }

        .settlement-arrow {
          text-align: center;
          flex: 1;
        }

        .settlement-card-action {
          display: flex;
          justify-content: center;
        }

        .settle-btn {
          width: 100%;
          padding: 10px 20px;
          border-radius: var(--radius-full);
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.875rem;
          border: none;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .settle-btn-pending {
          background: linear-gradient(135deg, var(--secondary-container), var(--secondary));
          color: var(--on-secondary);
        }

        .settle-btn-pending:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(78, 222, 163, 0.2);
        }

        .settle-btn-done {
          background: var(--surface-container-lowest);
          color: var(--on-surface-variant);
        }

        .settle-btn-done:hover {
          background: var(--surface-container);
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
