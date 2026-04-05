import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGroup } from '../hooks/useGroup'
import { getCategoryConfig } from '../data/categories'
import { formatINR } from '../lib/currency'
import { loadGroup, saveGroup } from '../lib/storage'

export default function ExpensesList() {
  const { group, groupId, refresh } = useGroup()
  const navigate = useNavigate()
  const [deleteTarget, setDeleteTarget] = useState(null) // expense object or null

  if (!group) return null

  const expenses = (group.expenses || []).slice().reverse()
  const members = group.members || []

  function getMemberName(id) {
    return members.find(m => m.id === id)?.name || 'Unknown'
  }

  function confirmDelete(expense) {
    setDeleteTarget(expense)
  }

  function executeDelete() {
    if (!deleteTarget) return
    const current = loadGroup(groupId)
    if (current) {
      current.expenses = current.expenses.filter(e => e.id !== deleteTarget.id)
      saveGroup(groupId, current)
      refresh()
    }
    setDeleteTarget(null)
  }

  return (
    <div className="page" id="expenses-list-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(`/group/${groupId}`)} id="btn-back">←</button>
        <div>
          <h1 className="headline-md">All Expenses</h1>
          <p className="body-sm text-muted">{expenses.length} expense{expenses.length !== 1 ? 's' : ''} · {group.name}</p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-title">No expenses yet</div>
          <div className="empty-state-text">Add your first expense to get started.</div>
        </div>
      ) : (
        <div className="expenses-list">
          {expenses.map((exp, idx) => {
            const catConfig = getCategoryConfig(exp.category)
            const payerNames = (exp.payers || []).map(p => getMemberName(p.member_id)).join(', ')
            const splitNames = (exp.splits || []).map(s => getMemberName(s.member_id))
            const amountINR = exp.total_amount * (exp.conversion_rate || 1)

            return (
              <div key={exp.id} className="expense-card animate-fade-in" style={{ animationDelay: `${idx * 0.03}s` }}>
                <div className="expense-card-top">
                  <div className="expense-card-info">
                    <span className="category-chip" style={{ color: catConfig.color }}>
                      {catConfig.icon} {exp.category}
                    </span>
                    <h3 className="title-md">{exp.description}</h3>
                    <p className="body-sm text-muted">
                      paid by {payerNames} · {new Date(exp.expense_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="expense-card-amount">
                    <span className="headline-sm text-primary">{formatINR(amountINR)}</span>
                    {exp.currency !== 'INR' && (
                      <span className="body-sm text-muted">
                        {exp.total_amount} {exp.currency}
                      </span>
                    )}
                  </div>
                </div>
                <div className="expense-card-bottom">
                  <span className="body-sm text-muted">
                    Split ({exp.split_type?.toLowerCase()}) among {splitNames.length}: {splitNames.join(', ')}
                  </span>
                  <div className="flex gap-sm">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/group/${groupId}/edit/${exp.id}`)}
                      style={{ padding: '4px 8px' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-tertiary btn-sm"
                      onClick={() => confirmDelete(exp)}
                      style={{ color: 'var(--error)', padding: '4px 8px' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Custom Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="dialog-overlay" onClick={() => setDeleteTarget(null)} id="delete-dialog-overlay">
          <div className="dialog-box" onClick={e => e.stopPropagation()}>
            <div className="dialog-icon">🗑️</div>
            <h3 className="headline-sm">Delete this expense?</h3>
            <div className="delete-expense-preview">
              <span className="body-md" style={{ fontWeight: 600 }}>{deleteTarget.description}</span>
              <span className="body-md text-primary" style={{ fontWeight: 700 }}>
                {formatINR(deleteTarget.total_amount * (deleteTarget.conversion_rate || 1))}
              </span>
            </div>
            <p className="body-sm text-muted">
              This action cannot be undone. The expense and all associated splits will be permanently removed.
            </p>
            <div className="dialog-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={executeDelete} id="btn-confirm-delete-expense">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .expenses-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .expense-card {
          background: var(--surface-container-high);
          border-radius: var(--radius-md);
          padding: var(--space-md);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .expense-card-top {
          display: flex;
          justify-content: space-between;
          gap: var(--space-md);
        }

        .expense-card-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .expense-card-amount {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          flex-shrink: 0;
        }

        .expense-card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Delete Confirmation Dialog */
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

        .delete-expense-preview {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: var(--space-md);
          background: var(--surface-container-lowest);
          border-radius: var(--radius-sm);
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
